#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Symbol, symbol_short
};

// 1. Define the storage key for user balances
#[contracttype]
pub enum DataKey {
    Balance(Address), // Maps User Address -> Amount Locked
}

#[contract]
pub struct CollateralVault;

#[contractimpl]
impl CollateralVault {
    
    // 2. The Deposit Function (The "Lock")
    // user: The person depositing (must sign this tx)
    // token: The address of the Stellar Asset (e.g., USDC or XLM contract address)
    // amount: How much to lock
    // destination: The Polkadot address to receive funds (String)
    pub fn deposit(env: Env, user: Address, token: Address, amount: i128, destination: soroban_sdk::String) {
        
        // A. Authorization: Ensure the user actually signed this transaction
        user.require_auth();

        // B. Transfer: Move funds from User -> This Contract
        // We use the standard Soroban Token Client to interact with XLM/USDC
        let client = token::Client::new(&env, &token);
        let contract_address = env.current_contract_address();
        
        // This pulls money FROM the user TO this contract
        client.transfer(&user, &contract_address, &amount);

        // C. Update Storage: Record that this user has locked funds
        let key = DataKey::Balance(user.clone());
        let current_balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        let new_balance = current_balance + amount;
        
        env.storage().persistent().set(&key, &new_balance);

        // D. THE BRIDGE TRIGGER (Crucial!)
        // We emit an event. Your off-chain bridge listener (Spacewalk) 
        // will see this event and mint the equivalent tokens on Polkadot.
        // Topic: (deposit, user, token)
        // Data: (amount, destination)
        let event_topic = (symbol_short!("deposit"), user, token);
        let event_data = (amount, destination);
        env.events().publish(event_topic, event_data);
    }

    // 3. The Liquidation/Withdraw Function (Called by the Bridge)
    // In a real app, you'd restrict this so only the Bridge Admin can call it
    // when a user burns their Polkadot tokens to get their XLM back.
    pub fn withdraw(env: Env, to: Address, token: Address, amount: i128) {
        // In production: Add admin checks here!
        
        let key = DataKey::Balance(to.clone());
        let current_balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        
        if amount > current_balance {
            panic!("Insufficient collateral locked!");
        }

        // Send funds back to the user
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &to, &amount);

        // Update storage
        let new_balance = current_balance - amount;
        env.storage().persistent().set(&key, &new_balance);
        
        // Emit withdraw event
        env.events().publish((symbol_short!("withdraw"), to), amount);
    }
}
