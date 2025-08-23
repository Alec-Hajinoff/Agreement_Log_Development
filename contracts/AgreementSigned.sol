// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgreementSigned {
    event SignedAgreementPublished(
        address indexed sender,
        bytes32 indexed agreementHash,
        uint256 indexed timestamp
    );

    function publishedAgreementHash(
        bytes32 agreementHash,
        uint256 timestamp
    ) external {
        emit SignedAgreementPublished(msg.sender, agreementHash, timestamp);
    }
}
