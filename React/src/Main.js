import React from "react";
import "./Main.css";

function Main() {
  return (
    <div>
      <p>
        Small businesses often rely on semi-formal agreements with suppliers or
        customers conducted via email. Our web application serves as a secure
        and verifiable email agreement log tailored for business users,
        providing an independent proof of existence and mutual acceptance of
        these agreements.
      </p>

      <p>
        Users can easily copy an agreement directly from their email and paste
        it into the application’s submission interface. On submission, the
        database securely stores the encrypted agreement along with a timestamp,
        and allows a counter party to electronically countersign the agreement.
      </p>

      <p>
        The agreement hash and timestamp are then also anchored on a public
        blockchain. Both parties can view all logged agreements, including
        hashes and timestamps, on a user-friendly dashboard. Importantly, all
        blockchain verification is transparent and accessible via public
        explorers.
      </p>

      <p>
        This solution delivers a practical, legally mindful approach to
        agreement logging and countersigning, combining cryptographic hashing,
        blockchain immutability, and minimal friction.
      </p>
    </div>
  );
}

export default Main;
