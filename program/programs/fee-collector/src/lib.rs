use anchor_lang::prelude::*;
use anchor_lang::system_program;

// NOTE: Replace with the real deployed program keypair before going to mainnet.
// Generate with: solana-keygen new --outfile fee-collector-keypair.json
// Then update both this declare_id! and [programs.localnet] in Anchor.toml.
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Seed used to derive the treasury PDA.
pub const TREASURY_SEED: &[u8] = b"treasury";
/// Seed used to derive the protocol config PDA.
pub const CONFIG_SEED: &[u8] = b"config";

#[program]
pub mod fee_collector {
    use super::*;

    /// Initialize the protocol config, storing the authority and fee reserve address.
    /// Must be called once by the deployer before any fees can be forwarded.
    pub fn initialize(ctx: Context<Initialize>, fee_reserve: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.fee_reserve = fee_reserve;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    /// Collect a fee from the payer and transfer it to the treasury PDA.
    /// `amount_lamports`: lamports to transfer from payer → treasury.
    pub fn collect_fee(ctx: Context<CollectFee>, amount_lamports: u64) -> Result<()> {
        require!(amount_lamports > 0, FeeError::ZeroAmount);
        require!(
            ctx.accounts.payer.lamports() >= amount_lamports,
            FeeError::InsufficientFunds
        );

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            amount_lamports,
        )?;

        emit!(FeeCollected {
            payer: ctx.accounts.payer.key(),
            treasury: ctx.accounts.treasury.key(),
            amount_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Forward accumulated lamports from the treasury PDA to the configured fee reserve.
    /// Only the authority stored in the config may call this instruction.
    pub fn forward_fees(ctx: Context<ForwardFees>) -> Result<()> {
        let config = &ctx.accounts.config;

        // Enforce authority
        require_keys_eq!(
            ctx.accounts.authority.key(),
            config.authority,
            FeeError::Unauthorized
        );

        // Enforce reserve address matches what was configured at initialization
        require_keys_eq!(
            ctx.accounts.fee_reserve.key(),
            config.fee_reserve,
            FeeError::InvalidReserveAccount
        );

        let rent = Rent::get()?;
        let min_balance = rent.minimum_balance(0);
        let current = ctx.accounts.treasury.lamports();

        require!(current > min_balance, FeeError::InsufficientFunds);

        let forward_amount = current.saturating_sub(min_balance);

        // Transfer via CPI using treasury PDA signer seeds
        let config_key = config.key();
        let seeds: &[&[u8]] = &[TREASURY_SEED, config_key.as_ref(), &[ctx.bumps.treasury]];

        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.fee_reserve.to_account_info(),
                },
                &[seeds],
            ),
            forward_amount,
        )?;

        emit!(FeesForwarded {
            treasury: ctx.accounts.treasury.key(),
            reserve: ctx.accounts.fee_reserve.key(),
            amount_lamports: forward_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// ─── State ───────────────────────────────────────────────────────────────────

#[account]
pub struct ProtocolConfig {
    pub authority: Pubkey,
    pub fee_reserve: Pubkey,
    pub bump: u8,
}

impl ProtocolConfig {
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

// ─── Accounts ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = ProtocolConfig::LEN,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    /// The treasury PDA that will receive fees. Created here so fee collection
    /// works deterministically without requiring a separate setup step.
    #[account(
        init,
        payer = authority,
        space = 0,
        seeds = [TREASURY_SEED, config.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Treasury PDA — the only valid fee destination, derived from the config.
    #[account(
        mut,
        seeds = [TREASURY_SEED, config.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, ProtocolConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ForwardFees<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [TREASURY_SEED, config.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// CHECK: Address is validated in the instruction against config.fee_reserve.
    #[account(mut)]
    pub fee_reserve: UncheckedAccount<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, ProtocolConfig>,

    pub system_program: Program<'info, System>,
}

// ─── Events ──────────────────────────────────────────────────────────────────

#[event]
pub struct FeeCollected {
    pub payer: Pubkey,
    pub treasury: Pubkey,
    pub amount_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct FeesForwarded {
    pub treasury: Pubkey,
    pub reserve: Pubkey,
    pub amount_lamports: u64,
    pub timestamp: i64,
}

// ─── Errors ──────────────────────────────────────────────────────────────────

#[error_code]
pub enum FeeError {
    #[msg("Fee amount must be greater than zero")]
    ZeroAmount,
    #[msg("Insufficient lamport balance")]
    InsufficientFunds,
    #[msg("Unauthorized: signer is not the authority")]
    Unauthorized,
    #[msg("Invalid reserve account: does not match configured fee_reserve")]
    InvalidReserveAccount,
}
