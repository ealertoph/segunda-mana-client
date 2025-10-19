import React from "react";
import "../../css/styles.css";

const ViewModal = ({ data, onClose }) => {
  if (!data) return null;

  const handleAcceptOrder = async () => {
    try {
      const token = sessionStorage.getItem("sg_admin_token");
      if (!token) {
        alert("You must be logged in as admin.");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/admin/orders/${data._id}/to-receive`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "to receive" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to accept order");
      alert("Order accepted successfully.");
      onClose?.();
      // Simple refresh to reflect status change in list
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to accept order");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Order Receipt</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Receipt view for orders */}
          {data.items ? (
            <div>
              <p><strong>Order ID:</strong> {data._id}</p>
              {data.buyerName && <p><strong>Buyer:</strong> {data.buyerName}</p>}
              {data.buyerEmail && <p><strong>Email:</strong> {data.buyerEmail}</p>}
              <p><strong>Date:</strong> {new Date(data.createdAt).toLocaleString()}</p>
              {data.paymentMethod && <p><strong>Payment:</strong> {String(data.paymentMethod).toUpperCase()}</p>}
              {data.orderType && <p><strong>Order Type:</strong> {data.orderType}</p>}
              {data.status && <p><strong>Status:</strong> {data.status}</p>}
              {data.address && (
                <p><strong>Address:</strong> {typeof data.address === 'string' ? data.address : JSON.stringify(data.address)}</p>
              )}

              {data.ticketVoucher?.code && (
                <p><strong>Voucher:</strong> {data.ticketVoucher.code} (expires {new Date(data.ticketVoucher.expiresAt).toLocaleDateString()})</p>
              )}

              {Array.isArray(data.items) && data.items.length > 0 && (
                <div style={{ marginTop: 12 }}>
                 
                </div>
              )}

              {data.proofOfPayment && (
                <div style={{ marginTop: 16 }}>
                  <p><strong>Proof of Payment:</strong></p>
                  <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={data.proofOfPayment} alt="Proof of payment" style={{ width: '100%', maxHeight: 420, objectFit: 'contain', background: '#fafafa' }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Fallback for plain product data
            <>
              <p><strong>ID:</strong> {data.id}</p>
              <p><strong>AR Ref No.:</strong> {data.arRef}</p>
              <p><strong>Name:</strong> {data.name}</p>
              <p><strong>Category:</strong> {data.category}</p>
              <p><strong>Size:</strong> {data.size}</p>
              <p><strong>Price:</strong> ₱{data.price}</p>
              <p><strong>Status:</strong> {data.status}</p>
              <p><strong>Description:</strong> {data.description}</p>
              
            </>
          )}
        </div>

        <div className="modal-actions">
          {/* {data.items && (
            // <button className="btn-accept" onClick={handleAcceptOrder}>
            //   Accept Order
            // </button>
          )} */}
          <button className="btn primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
