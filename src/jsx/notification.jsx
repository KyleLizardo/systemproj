import "../styling/notif.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function Notification({ data }) {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "yyyy/mm/dd hh:mm";

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString(); // This will include both date and time
  };

  return (
    <div className="notif1">
      <img src={data.imageUrl || ""} alt="notifImg" className="notifImg" />
      <div className="innerBody">
        <p id="pxD" className="notifName">
          {data.objectName || "Notif Name"}
        </p>
        <label id="labelxD" className="notifDesc">
          {data.message || "Notif Desc"}
        </label>
        <p className="notifDate">{formatTimestamp(data.timestamp)}</p>
      </div>
    </div>
  );
}

export default Notification;
