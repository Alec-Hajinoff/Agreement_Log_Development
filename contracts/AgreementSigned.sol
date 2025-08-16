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