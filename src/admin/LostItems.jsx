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

function lostitems() {
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

  // Fetch data using Supabase
  useEffect(() => {
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
        .eq("type", "Found") // Filter items where type is "Found"
        .eq("confirmed", true) // Add this line to only fetch items where confirmed is true
        .order("createdat", { ascending: false }); // Order by createdAt in descending order

      // Apply filters directly in Supabase query
      if (categoryFilter) {
        query = query.eq("category", categoryFilter);
      }

      if (colorFilter) {
        query = query.eq("color", colorFilter);
      }

      if (dateRange.start) {
        query = query.gte("datefound", dateRange.start); // Start date filter
      }

      if (dateRange.end) {
        query = query.lte("datefound", dateRange.end); // End date filter
      }

      // Order items by dateFound and timeFound
      const { data, error } = await query
        .order("datefound", { ascending: false })
        .order("timefound", { ascending: false });

      if (error) {
        console.error("Error fetching found items:", error);
      } else {
        const items = data.map((item) => {
          const userName =
            item.userinfo?.firstname && item.userinfo?.lastname
              ? `${item.userinfo.firstname} ${item.userinfo.lastname}`
              : "N/A";
          return {
            ...item,
            userName,
          };
        });
        setFoundItems(items);
      }
    };


    fetchFoundItems();
  }, [categoryFilter, colorFilter, dateRange]); // Re-fetch when filters change

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

      const holderId = itemData.holderId;

      if (!holderId) {
        console.error("No holder ID found for this item:", currentItemId);
        return; // Stop if no holder ID is available
      }

      // Update the item report to mark the user as notified
      await supabase
        .from("item_reports2")
        .update({ notified: true })
        .eq("id", currentItemId);

      console.log(
        `Notification sent for item ${currentItemId} to holder ${holderId}`
      );

      // Check if notificationText is defined
      if (!notificationText) {
        console.error("Notification text is not defined.");
        return; // Stop if no notification text is available
      }

      // Create a new notification record
      const { error: notifError } = await supabase
        .from("notifications")
        .insert([
          {
            userId: holderId,
            itemId: currentItemId,
            objectName: itemData.objectname || "Unknown Item",
            message: notificationText,
            timestamp: new Date(),
          },
        ]);

      if (notifError) {
        console.error("Error sending notification:", notifError);
      } else {
        console.log("Notification added successfully");
        setShowNotifModal(false);
      }
    } catch (error) {
      console.error("Error sending notification: ", error);
    }
  };

  const openClaimModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowClaimModal(true);
  };

  const handleArchiveItem = async () => {
    if (!currentItemId || !remark.trim()) return; // Ensure itemId and remark are provided

    try {
      const { error } = await supabase
        .from("item_reports2")
        .update({
          status: "archived",
          archiveremark: remark, // Save the archive remark
        })
        .eq("id", currentItemId);

      if (error) {
        console.error("Error archiving item:", error);
      } else {
        setFoundItems(foundItems.filter(item => item.id !== currentItemId)); // Remove the archived item from the list
        setShowRemoveModal(false); // Close the modal
        setArchiveRemark(""); // Clear the remark input
        console.log("Item archived successfully.");
      }
    } catch (error) {
      console.error("Error archiving item: ", error);
    }
  };

  const handleClaimItem = async () => {
    // Ensure claim details are filled out
    if (
      !claimerDetails.claimedBy.trim() ||
      !claimerDetails.claimContactNumber.trim() ||
      !claimerDetails.claimEmail.trim()
    ) {
      return; // Exit if any claim detail is missing
    }

    try {
      // Update the item status to "claimed" in the database
      const { error } = await supabase
        .from("item_reports2")
        .update({
          status: "claimed",
          claimedby: claimerDetails.claimedBy,
          claimcontactnumber: claimerDetails.claimContactNumber,
          claimemail: claimerDetails.claimEmail,
        })
        .eq("id", currentItemId);

      if (error) {
        console.error("Error updating claim status:", error);
        return; // Exit if there's an error during the update
      }

      // Re-fetch the updated list of found items
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
          .eq("type", "Found")
          .eq("confirmed", true)
          .order("createdat", { ascending: false });

        // Apply filters directly in the query
        if (categoryFilter) {
          query = query.eq("category", categoryFilter);
        }
        if (colorFilter) {
          query = query.eq("color", colorFilter);
        }
        if (dateRange.start) {
          query = query.gte("datefound", dateRange.start);
        }
        if (dateRange.end) {
          query = query.lte("datefound", dateRange.end);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error fetching updated items:", fetchError);
        } else {
          setFoundItems(data);
        }
      };

      await fetchFoundItems(); // Fetch updated data to reflect changes
      setShowClaimModal(false); // Close the claim modal
      setClaimerDetails({
        claimedBy: "",
        claimContactNumber: "",
        claimEmail: "",
      }); // Reset claim details form
      console.log("Item successfully marked as claimed.");
    } catch (error) {
      console.error("Error handling claim:", error);
    }
  };

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Found Item Reports</p>
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
                  <label className="lostitemlabel2">Date Found</label>
                  <label className="lostitemlabel3">
                    {item.datefound} at {item.timefound}
                  </label>
                  <label className="lostitemlabel2">Location Found</label>
                  <label className="lostitemlabel3">{item.locationfound}</label>
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


    </>
  );
}

export default lostitems;
