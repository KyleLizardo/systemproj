import React, { useState, useEffect } from "react";
import "./Admin.css";
import { supabase } from "../supabaseClient"; // Adjust the path accordingly

function Archive() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showCheckboxContainer, setShowCheckboxContainer] = useState(true);

  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    category: true,
    brand: true,
    color: true,
    objectname: true,
    reportedbyname: true,
    reportedbycontact: true,
    reportedbyemail: true,
    datefound: true,
    locationfound: true,
    datelost: true,
    locationlost: true,
    status: true,
    archiveremark: true,
  });

  const showCustomCheckbox = () => {
    setShowCheckboxContainer((prev) => !prev);
  };

  const columnLabels = {
    type: "Report Type",
    category: "Category",
    brand: "Brand",
    color: "Color",
    objectname: "Object Name",
    reportedbyname: "Reported By Name",
    reportedbycontact: "Reported By Contact",
    reportedbyemail: "Reported By Email",
    datefound: "Date Found",
    locationfound: "Location Found",
    datelost: "Date Lost",
    locationlost: "Location Lost",
    status: "Status",
    archiveremark: "Archive Reason",
  };

  const selectAllColumns = () => {
    setVisibleColumns(
      Object.keys(visibleColumns).reduce((acc, column) => {
        acc[column] = true;
        return acc;
      }, {})
    );
  };

  const columnVisibilitySettings = {
    lost: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      reportedbyname: true,
      reportedbycontact: true,
      reportedbyemail: true,
      datefound: true,
      locationfound: true,
      datelost: false,
      locationlost: false,
      status: true,
      archiveremark: true,
    },
    pending: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      reportedbyname: true,
      reportedbycontact: true,
      reportedbyemail: true,
      datefound: false,
      locationfound: false,
      datelost: true,
      locationlost: true,
      status: true,
      archiveremark: true,
    },
    claimed: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      reportedbyname: true,
      reportedbycontact: true,
      reportedbyemail: true,
      datefound: false,
      locationfound: false,
      datelost: false,
      locationlost: false,
      status: true,
      archiveremark: true,
    },
    all: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      reportedbyname: true,
      reportedbycontact: true,
      reportedbyemail: true,
      datefound: true,
      locationfound: true,
      datelost: true,
      locationlost: true,
      status: true,
      remark: true,
    },
  };

  const deselectAllColumns = () => {
    setVisibleColumns(
      Object.keys(visibleColumns).reduce((acc, column) => {
        acc[column] = false;
        return acc;
      }, {})
    );
  };
  const fetchUserInfo = async (userId) => {
    const { data, error } = await supabase
      .from("userinfo")
      .select("firstname, lastname, contact, email")
      .eq("id", userId)
      .single(); // Ensure only one user info is fetched
    if (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await supabase.from("item_reports2").select("*");
      const itemsWithUserInfo = await Promise.all(
        result.data.map(async (item) => {
          // Fetch user info based on the holderid
          const userInfo = await fetchUserInfo(item.holderid);
          return {
            ...item,
            reportedbyname: `${userInfo.firstname} ${userInfo.lastname}`,
            reportedbycontact: userInfo.contact,
            reportedbyemail: userInfo.email,
          };
        })
      );
      setItems(itemsWithUserInfo);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("item_reports2")
          .select("*");

        if (error) throw error;

        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleCheckboxChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    setVisibleColumns(columnVisibilitySettings[selectedFilter]);
  };

  const filteredItems = items.filter((item) => {
    // Use status for the "Claimed" filter

    // Use type for the "Lost" and "Missing" filters
    const matchesType =
      (filter === "lost" && item.type === "Lost") ||
      (filter === "pending" && item.type === "Found") ||
      (filter === "claimed" && item.status === "claimed") ||
      filter === "all" // All items are included when "all" is selected
        ? true
        : false;

    const matchesCategory =
      categoryFilter === "Others"
        ? !["Personal Belonging", "Electronics", "Documents"].includes(
            item.category
          )
        : categoryFilter
        ? item.category === categoryFilter
        : true;

    const matchesColor = colorFilter ? item.color === colorFilter : true;

    const itemDate = new Date(item.createdAt);
    const matchesDateRange =
      (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
      (!dateRange.end || itemDate <= new Date(dateRange.end));

    // Only include items where confirmed is not false
    const isConfirmed = item.confirmed !== false;
    const archive = item.status === "archived";

    return (
      matchesType &&
      matchesCategory &&
      matchesColor &&
      matchesDateRange &&
      isConfirmed &&
      archive
    );
  });

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Archived Reports</p>
          <div className="categoryx">
            <p>Filter</p>
            <button onClick={() => handleFilterChange("all")}>All</button>
            <button onClick={() => handleFilterChange("lost")}>Lost</button>
            <button onClick={() => handleFilterChange("pending")}>
              Missing
            </button>
            <button
              id="buttonclaimed"
              onClick={() => handleFilterChange("claimed")}
            >
              Claimed
            </button>
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
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
              />
              <label className="tolabel">–</label>

              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                min={dateRange.start}
              />
            </div>
          </div>
        </div>

        <label className="adminh2">{filteredItems.length}</label>
      </div>
      <div className="showCheckbox">
        <p>Select Columns:</p>
        <div className="checkbox-buttons">
          <button onClick={selectAllColumns}>Select All</button>
          <button onClick={deselectAllColumns}>Deselect All</button>
          <button className="togglev" onClick={showCustomCheckbox}>
            Toggle
          </button>{" "}
        </div>
      </div>

      {showCheckboxContainer && (
        <div className="checkbox-container">
          {Object.keys(visibleColumns).map((column) => (
            <div key={column}>
              <input
                type="checkbox"
                checked={visibleColumns[column]}
                onChange={() => handleCheckboxChange(column)}
              />
              <label>{columnLabels[column]}</label>
            </div>
          ))}
        </div>
      )}
      <div className="dashboardbody">
        <div className="dashboardtable">
          <div className="table-containerAll">
            <table className="report-table">
              <thead>
                <tr>
                  {Object.keys(visibleColumns).map(
                    (column) =>
                      visibleColumns[column] && (
                        <th key={column}>{columnLabels[column]}</th>
                      )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      {Object.keys(visibleColumns).map(
                        (column) =>
                          visibleColumns[column] && (
                            <td key={column}>{item[column]}</td>
                          )
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={Object.keys(visibleColumns).length}>
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Archive;
