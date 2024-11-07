import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faCheck,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient"; // Import Supabase client

function Pending() {
  const [foundItems, setFoundItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [currentHolderId, setCurrentHolderId] = useState(null);
  const [notificationText, setNotificationText] = useState(
    "Your lost item might have been matched."
  );
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [remark, setArchiveRemark] = useState("");
  const [claimerDetails, setClaimerDetails] = useState({
    claimedBy: "",
    claimContactNumber: "",
    claimEmail: "",
  });
  const fetchFoundItems = async () => {
    let query = supabase
      .from("item_reports2")
      .select(
        `
        *,
        userinfo:holderid (firstname, lastname, email, contact)
      `
      )
      .eq("status", "pending")
      .eq("type", "Lost")
      .order("createdat", { ascending: false }); // Order by createdAt in descending order

    if (categoryFilter) query = query.eq("category", categoryFilter);
    if (colorFilter) query = query.eq("color", colorFilter);
    if (dateRange.start) query = query.gte("datelost", dateRange.start);
    if (dateRange.end) query = query.lte("datelost", dateRange.end);

    const { data, error } = await query
      .order("datelost", { ascending: false })
      .order("timelost", { ascending: false });

    if (error) {
      console.error("Error fetching found items:", error);
    } else {
      const items = data.map((item) => {
        const userName = item.userDetails?.name || "N/A";
        return { ...item, userName };
      });
      setFoundItems(items);
    }
  };

  // Fetch data using Supabase
  useEffect(() => {
    fetchFoundItems();
  }, [categoryFilter, colorFilter, dateRange]);

  const openRemoveModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowRemoveModal(true);
  };

  const openNotifModal = (itemId, holderId) => {
    setCurrentItemId(itemId);
    setCurrentHolderId(holderId);
    setShowNotifModal(true);
  };

  const handleSendNotification = async () => {
    try {
      const { data: itemData, error: fetchError } = await supabase
        .from("item_reports2")
        .select("*")
        .eq("id", currentItemId)
        .single();

      if (fetchError) {
        console.error("Error fetching item data:", fetchError);
        return;
      }

      const holderId = itemData.holderid;

      if (!holderId) {
        console.error("No holder ID found for this item:", currentItemId);
        return; // Stop if no holder ID is available
      }

      // Update the item report to mark the user as notified
      await supabase
        .from("item_reports2")
        .update({
          notified: true,
          message: notificationText,
          notifdate: new Date(),
        })
        .eq("id", currentItemId);

      console.log(
        `Notification sent for item ${currentItemId} to holder ${holderId}`
      );
      setShowNotifModal(false);

      // Check if notificationText is defined
      if (!notificationText) {
        console.error("Notification text is not defined.");
        return; // Stop if no notification text is available
      }
    } catch (error) {
      console.error("Error sending notification: ", error);
    }
  };

  const openClaimModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowClaimModal(true);
  };
  const handleArchiveItem = async (itemId) => {
    if (!itemId || !remark.trim()) return;

    try {
      const { error } = await supabase
        .from("item_reports2")
        .update({
          status: "archived",
          archiveremark: remark,
        })
        .eq("id", itemId);

      if (error) {
        console.error("Error archiving item:", error);
      } else {
        fetchFoundItems(); // Re-fetch items after archiving
        console.log("Item archived and items refreshed.");
      }
    } catch (error) {
      console.error("Error archiving item: ", error);
    }
  };
  const handleClaimItem = async () => {
    if (
      !claimerDetails.claimedBy.trim() ||
      !claimerDetails.claimContactNumber.trim() ||
      !claimerDetails.claimEmail.trim()
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("item_reports2")
        .update({
          status: "claimed",
          claimedby: claimerDetails.claimedBy,
          claimcontactnumber: claimerDetails.claimContactNumber,
          claimemail: claimerDetails.claimEmail,
          dateclaimed: new Date(),
        })
        .eq("id", currentItemId);

      if (error) {
        console.error("Error updating claim status:", error);
      } else {
        fetchFoundItems(); // Re-fetch items to reflect the updated status
        setShowClaimModal(false); // Close the modal after updating
        setClaimerDetails({
          claimedBy: "",
          claimContactNumber: "",
          claimEmail: "",
        }); // Reset the form
        console.log("Item successfully marked as claimed.");
      }
    } catch (error) {
      console.error("Error handling claim:", error);
    }
  };

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Missing Item Reports</p>
          <div className="categoryx">
            <p>Filter</p>
            <select
              className="categorybutton"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Personal Belonging">Personal Belonging</option>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents</option>
              <option value="Others">Others</option>
            </select>

            <select
              className="categorybutton"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <option value="">All Colors</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Purple">Purple</option>
              <option value="Pink">Pink</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Gray">Gray</option>
            </select>

            <div className="dateDiv">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setDateRange((prev) => ({
                    ...prev,
                    start: newStart,
                    end: prev.end < newStart ? newStart : prev.end,
                  }));
                }}
              />
              <label className="tolabel">–</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                min={dateRange.start}
              />
            </div>
          </div>
        </div>
        <label className="adminh2">{foundItems.length} </label>
      </div>

      <div className="containerlostdata">
        {foundItems.map((item) => (
          <div key={item.id} className="lostitemcontainer">
            <img
              className="lostitemimg"
              src={item.imageurl || placeholder}
              alt="Lost Item"
            />
            <div className="lostitembody">
              <div className="lostitemtop">
                <label className="lostitemlabel">{item.objectname}</label>
                <div className="buttonslost">
                  <button
                    className="lostitemimg2"
                    id="notifyuser"
                    onClick={() => openNotifModal(item.id, item.holderid)}
                  >
                    <FontAwesomeIcon icon={faBell} />
                  </button>
                  <button
                    className="lostitemimg2"
                    id="removelostitem"
                    onClick={() => openRemoveModal(item.id)}
                  >
                    <FontAwesomeIcon icon={faBoxArchive} />
                  </button>
                  <button
                    className="lostitemimg2"
                    id="checklostitem"
                    onClick={() => openClaimModal(item.id)}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </div>
              </div>
              <div className="lostitembody1">
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Category</label>
                  <label className="lostitemlabel3">{item.category}</label>
                  <label className="lostitemlabel2">Brand</label>
                  <label className="lostitemlabel3">{item.brand}</label>
                  <label className="lostitemlabel2">Color</label>
                  <label className="lostitemlabel3">{item.color}</label>
                </div>
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Reported by:</label>
                  <label className="lostitemlabel3">
                    {item.userinfo?.firstname && item.userinfo?.lastname
                      ? `${item.userinfo.firstname} ${item.userinfo.lastname}`
                      : "N/A"}
                  </label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">
                    {item.userinfo?.contact}
                  </label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">
                    {item.userinfo?.email}
                  </label>
                </div>
                <div className="lostitempanel2">
                  <label className="lostitemlabel2">Date Lost</label>
                  <label className="lostitemlabel3">
                    {item.datelost} at {item.timelost}
                  </label>
                  <label className="lostitemlabel2">Location Lost</label>
                  <label className="lostitemlabel3">{item.locationlost}</label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showRemoveModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Archive this item?</p>
            <input
              placeholder="Archive Reason"
              value={remark} // Bind to state
              onChange={(e) => setArchiveRemark(e.target.value)} // Update state on change
            />
            <div className="modalBtnDiv">
              <button
                onClick={() => {
                  handleArchiveItem(currentItemId);
                  setShowRemoveModal(false); // Close modal after archiving
                }}
                disabled={!remark.trim()} // Disable if remark is empty
              >
                Yes
              </button>
              <button onClick={() => setShowRemoveModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      {showClaimModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Claim Item</h2>

            <label>Claimed By:</label>
            <input
              type="text"
              value={claimerDetails.claimedBy}
              onChange={(e) =>
                setClaimerDetails({
                  ...claimerDetails,
                  claimedBy: e.target.value,
                })
              }
              required
            />

            <label>Contact Number:</label>
            <input
              type="number"
              value={claimerDetails.claimContactNumber}
              onChange={(e) =>
                setClaimerDetails({
                  ...claimerDetails,
                  claimContactNumber: e.target.value,
                })
              }
              required
              onWheel={(e) => e.target.blur()} // Prevent number scroll behavior
            />

            <label>Email:</label>
            <input
              type="email"
              value={claimerDetails.claimEmail}
              onChange={(e) =>
                setClaimerDetails({
                  ...claimerDetails,
                  claimEmail: e.target.value,
                })
              }
              required
            />

            <div className="modal-buttons">
              <button onClick={() => setShowClaimModal(false)}>Cancel</button>
              <button
                onClick={handleClaimItem}
                disabled={
                  !claimerDetails.claimedBy.trim() ||
                  !claimerDetails.claimContactNumber.trim() ||
                  !claimerDetails.claimEmail.trim()
                }
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotifModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Send Notification</h2>
            <p>Customize the notification message:</p>
            <input
              type="text"
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowNotifModal(false)}>Cancel</button>
              <button
                onClick={handleSendNotification}
                disabled={!notificationText.trim()} // Disable button if notificationText is empty
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Pending;
