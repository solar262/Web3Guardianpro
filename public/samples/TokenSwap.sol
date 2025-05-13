// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TokenSwap
 * @dev A contract for swapping tokens that contains several common security vulnerabilities
 * for demonstration purposes.
 * WARNING: This contract is for testing/educational purposes only and should NOT be used in production.
 */
contract TokenSwap {
    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowance;
    address public owner;
    bool private locked = false;
    
    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);
    event Swap(address indexed from, address indexed to, uint amount);

    constructor() {
        owner = msg.sender;
    }

    // Vulnerability #1: Reentrancy
    function withdraw(uint amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Vulnerability: State change after external call
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
        
        emit Withdraw(msg.sender, amount);
    }

    // Fixed version of withdraw with reentrancy guard
    function withdrawSafe(uint amount) external {
        require(!locked, "Reentrant call");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        locked = true;
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        locked = false;
        
        emit Withdraw(msg.sender, amount);
    }

    // Vulnerability #2: Unchecked Return Value
    function transfer(address to, uint amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        
        // Vulnerability: Not checking return value
        to.call{value: amount}("");
        
        emit Swap(msg.sender, to, amount);
    }

    // Vulnerability #3: tx.origin Usage
    function checkOwnership() external view returns (bool) {
        // Vulnerability: Using tx.origin for authentication
        return tx.origin == owner;
    }

    // Vulnerability #4: Integer Overflow (for Solidity <0.8.0)
    function addToBalance(uint amount) external {
        // Vulnerability: Integer overflow in Solidity <0.8.0
        balances[msg.sender] += amount;
    }

    // Deposit function
    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Cleanup function
    function kill() external {
        require(msg.sender == owner, "Not authorized");
        selfdestruct(payable(owner));
    }
}
