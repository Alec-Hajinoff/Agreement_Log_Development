// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgreementSigned {
    event SignedAgreementPublished(
        address indexed sender,
        bytes32 indexed agreementHash
    );

    function publishedAgreementHash(bytes32 agreementHash) external {
        emit SignedAgreementPublished(msg.sender, agreementHash);
    }
}

/*
pragma solidity ^0.8.24;

contract InsuranceFund {
    address public backendAdmin;

    constructor() {
        backendAdmin = msg.sender; // Records the deployer’s wallet as backend admin at the time when you deploy the contract for the first time
    }

    modifier onlyBackend() {
        require(msg.sender == backendAdmin, "Unauthorized caller"); // Only the backend admin can call functions with this modifier
        _;
    }

    mapping(address => uint256) public premiums; // Mapping address-to-integer to store premiums for each insured
    mapping(address => uint256) public pendingPayouts;
    mapping(address => bool) private hasPaid;
    address[] public insureds; // Array to keep track of insured addresses

    event PremiumPaid(address indexed insured, uint256 amount); // Event emitted when a premium is paid
    event PayoutRegistered(address indexed insured, uint256 amount);
    event PayoutClaimed(address indexed insured, uint256 amount);

    function payPremium() external payable {
        // Function to pay premium and register insured
        require(msg.value > 0, "Must send ETH");
        premiums[msg.sender] += msg.value;

        if (!hasPaid[msg.sender]) {
            insureds.push(msg.sender);
            hasPaid[msg.sender] = true;
        }

        emit PremiumPaid(msg.sender, msg.value);
    }

    function registerPayout(address insured, uint256 amount) external {
        // Function to register a pending payout for an insured address
        require(amount > 0, "Payout must be greater than zero");
        require(premiums[insured] > 0, "Insured has no premiums");
        pendingPayouts[insured] += amount; // 'insured' is the function parameter, it's not related to the 'insureds' array

        emit PayoutRegistered(insured, amount);
    }

    function claimPayout(address insured) external onlyBackend {
        // Function to claim a registered payout
        uint256 payoutAmount = pendingPayouts[insured];
        require(payoutAmount > 0, "No pending payout");
        require(address(this).balance >= payoutAmount, "Insufficient funds"); // 'this' is the contract itself

        pendingPayouts[insured] = 0;
        payable(insured).transfer(payoutAmount);

        emit PayoutClaimed(insured, payoutAmount);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
*/
