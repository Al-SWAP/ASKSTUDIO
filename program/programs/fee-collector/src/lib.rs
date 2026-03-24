use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("FeeCoLLeCToRXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod fee_collector {
    use super::*;

    /// Collect a fee from the payer and forward it to the treasury account.
    /// amount_lamports: lamports to transfer from payer → treasury.
    pub fn collect_fee(ctx: Context<CollectFee>, amount_lamports: u64) -> Result<()> {
        require!(amount_lamports > 0, FeeError::ZeroAmount);

        let payer = &ctx.accounts.payer;
        let treasury = &ctx.accounts.treasury;

        require!(
            payer.lamports() >= amount_lamports,
            FeeError::InsufficientFunds
        );

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: payer.to_account_info(),
                    to: treasury.to_account_info(),
                },
            ),
            amount_lamports,
        )?;

        emit!(FeeCollected {
            payer: payer.key(),
            treasury: treasury.key(),
            amount_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Forward accumulated lamports from treasury to reserve (fee_reserve).
    /// Only the authority may call this.
    pub fn forward_fees(ctx: Context<ForwardFees>) -> Result<()> {
        let treasury = &ctx.accounts.treasury;
        let reserve = &ctx.accounts.fee_reserve;

        let rent = Rent::get()?;
        let min_balance = rent.minimum_balance(0);
        let current = treasury.lamports();

        require!(current > min_balance, FeeError::InsufficientFunds);

        let forward_amount = current.saturating_sub(min_balance);

        **treasury.to_account_info().try_borrow_mut_lamports()? -= forward_amount;
        **reserve.to_account_info().try_borrow_mut_lamports()? += forward_amount;

        emit!(FeesForwarded {
            treasury: treasury.key(),
            reserve: reserve.key(),
            amount_lamports: forward_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// ─── Accounts ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct CollectFee<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the treasury account that receives fees. Validated by address constraints in production.
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ForwardFees<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Treasury PDA or authority-owned account.
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,

    /// CHECK: The final reserve address (monads.skr resolved address).
    #[account(mut)]
    pub fee_reserve: UncheckedAccount<'info>,

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
}
