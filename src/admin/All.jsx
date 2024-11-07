import React, { useState, useEffect } from "react";
import "./Admin.css";
import { supabase } from "../supabaseClient"; // Adjust the path accordingly

function All() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all"); // Default filter state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showCheckboxContainer, setShowCheckboxContainer] = useState(true);

  // Columns state to manage visibility
  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    category: true,
    brand: true,
    color: true,
    objectname: true,
    name: true,
    contactnumber: true,
    email: true,
    datefound: true,
    locationfound: true,
    datelost: true,
    locationlost: true,
    claimedby: true,
    claimemail: true,
    claimcontactnumber: true,
    dateclaimed: true,
    status: true,
  });

  const showCustomCheckbox = () => {
    setShowCheckboxContainer((prev) => !prev);
  };

  // Mapping for column display names
  const columnLabels = {
    type: "Report Type",
    category: "Category",
    brand: "Brand",
    color: "Color",
    objectname: "Object Name",
    name: "Reported By Name",
    contactnumber: "Reported By Contact",
    email: "Reported By Email",
    datefound: "Date Found",
    locationfound: "Location Found",
    datelost: "Date Lost",
    locationlost: "Location Lost",
    claimedby: "Claimer's Name",
    claimemail: "Claimer's Email",
    claimcontactnumber: "Claimer's Contact",
    dateclaimed: "Date Claimed",
    status: "Status",
  };

  // Select all columns
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
      name: true,
      contactnumber: true,
      email: true,
      datefound: false,
      locationfound: false,
      datelost: false,
      locationlost: false,
      claimedby: false,
      claimemail: false,
      claimcontactnumber: false,
      dateclaimed: false,
      status: true,
    },
    pending: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      name: true,
      contactnumber: true,
      email: true,
      datefound: false,
      locationfound: false,
      datelost: true,
      locationlost: true,
      claimedby: false,
      claimemail: false,
      claimcontactnumber: false,
      dateclaimed: false,
      status: true,
    },
    claimed: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      name: true,
      contactnumber: true,
      email: true,
      datefound: false,
      locationfound: false,
      datelost: false,
      locationlost: false,
      claimedby: true,
      claimemail: true,
      claimcontactnumber: true,
      dateclaimed: true,
      status: true,
    },
    all: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      name: true,
      contactnumber: true,
      email: true,
      datefound: true,
      locationfound: true,
      datelost: true,
      locationlost: true,
      claimedby: true,
      claimemail: true,
      claimcontactnumber: true,
      dateclaimed: true,
      status: true,
    },
  };

  // Deselect all columns
  const deselectAllColumns = () => {
    setVisibleColumns(
      Object.keys(visibleColumns).reduce((acc, column) => {
        acc[column] = false;
        return acc;
      }, {})
    );
  };

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from("item_reports2").select("*");

      if (error) {
        console.error("Error fetching data: ", error);
      } else {
        setItems(data);
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

    // Adjust column visibility based on the selected filter
    if (selectedFilter === "lost" || selectedFilter === "pending") {
      setVisibleColumns({
        ...columnVisibilitySettings.all,
        type: true, // Ensure 'type' column is visible for all
      });
    } else if (selectedFilter === "claimed") {
      setVisibleColumns({
        ...columnVisibilitySettings.claimed,
        type: true, // Ensure 'type' column is visible for all
      });
    } else {
      setVisibleColumns(columnVisibilitySettings[selectedFilter]);
    }
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

    return (
      matchesType &&
      matchesCategory &&
      matchesColor &&
      matchesDateRange &&
      isConfirmed
    );
  });

  // Modify the rendering of the type column based on the filter
  const getTypeDisplay = (type) => {
    if (filter === "lost" && type === "Found") {
      return "Lost"; // If filtered by "lost", show "Found" as "Lost"
    }
    if (filter === "pending" && type === "Lost") {
      return "Missing"; // If filtered by "pending", show "Lost" as "Missing"
    }
    return type; // Otherwise, show the original type
  };

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">All Items</p>
          <div className="categoryx">
            <p>Filter</p>
            <button onClick={() => handleFilterChange("all")}>All</button>
            <button onClick={() => handleFilterChange("lost")}>Lost</button>
            <button onClick={() => handleFilterChange("pending")}>
              Missing
            </button>
            <button onClick={() => handleFilterChange("claimed")}>
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
                            <td key={column}>
                              {column === "type"
                                ? getTypeDisplay(item[column])
                                : item[column] || "N/A"}
                            </td>
                          )
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="18">No items found</td>
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

export default All;
