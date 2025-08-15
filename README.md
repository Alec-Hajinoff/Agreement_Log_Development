Small and medium-sized businesses often rely on semi-formal agreements with suppliers or customers conducted via email. Our web application serves as a secure and verifiable email agreement log tailored for business users, providing an independent proof of existence and mutual acceptance of these agreements.

Users can easily copy an agreement directly from their email and paste it into the application’s submission interface. Upon submission, the backend securely stores the agreement text—encrypted at rest—and generates a unique SHA-256 hash along with a timestamp marking the moment of entry.

This hash and timestamp are then recorded both in the application database and immutably anchored on a public blockchain via a Solidity smart contract. The system returns the hash and a secure, single-use token to the creator, who shares a link containing these with the counterparty through their preferred communication channel.

The counterparty accesses the link, reviews the exact agreement text, and if they agree, provides their name and confirms acceptance by clicking the countersign button. This action is recorded with additional metadata such as IP address and timestamp, and the countersign event’s hash and timestamp are also submitted to the blockchain.

Both parties can view all logged agreements, including hashes, timestamps, and countersign metadata, on a user-friendly dashboard. Importantly, all blockchain verification is transparent and accessible via public explorers—no cryptocurrency wallet or special software is required.

This solution delivers a practical, legally mindful approach to agreement logging and countersigning, combining cryptographic hashing, blockchain immutability, and minimal friction in a technology stack comprising React (frontend), PHP (backend), MySQL (database), and Solidity (smart contracts).

