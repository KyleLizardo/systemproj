import "../styling/homepage2.css";
import logo from "../assets/NULAFD_LOGO.svg";
import notif from "../assets/notif.svg";
import img1 from "../assets/info-1-1.png";
import img2 from "../assets/info-2-2.png";
import Report1_Img from "../assets/Report1_Img.png";
import Report2_Img from "../assets/Report2_Img.png";
import Memo1Img from "../assets/Memo1Img.png";
import Memo2Img from "../assets/Memo2Img.png";
import Report1Img from "../assets/Report1Img.png";
import Report2Img from "../assets/Report2Img.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { collectionGroup, onSnapshot, collection } from "firebase/firestore";
import { db } from "./firebase"; // Import Firestore instance
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import Notification from "./notification"; // Import your notification component
import { supabase } from "../config/firebase"; // Adjust the path according to your project structure

function Homepage2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);
  const [foundItems, setFoundItems] = useState([]);
  const [notifications, setNotifications] = useState([]); // State to hold notifications
  const [showNotifications, setShowNotifications] = useState(false); // State to toggle notifications
  const [foundItemsPending, setFoundItemsPending] = useState(0);
  const [lostItemsPending, setLostItemsPending] = useState(0);
  const lastScrollTimeRef = useRef(0); // Ref to track last scroll time
  const textRefs = useRef([]); // For text containers
  const imgRefs = useRef([]); // For image containers
  const homepageRef = useRef(null); // For HomePageContent
  const itemStatusRef = useRef(null); // For ItemStatus
  const [activeLink, setActiveLink] = useState("Home"); // Track the active section
  const sectionRefs = useRef([]); // Ref for the sections
  const handleNavClick = (e, targetId) => {
    e.preventDefault(); // Prevent default anchor behavior
    const targetSection = document.getElementById(targetId); // Get the target section element
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" }); // Scroll smoothly to the target section
    }
  };


  const fetchCounts = async () => {
    try {
      // Fetch count of 'found' items with 'pending' status
      const { count: foundCount, error: foundError } = await supabase
        .from("item_reports2")
        .select("*", { count: "exact" })
        .eq("type", "Found")
        .eq("status", "pending");

      if (foundError) throw foundError;
      setFoundItemsPending(foundCount);

      // Fetch count of 'lost' items with 'pending' status
      const { count: lostCount, error: lostError } = await supabase
        .from("item_reports2")
        .select("*", { count: "exact" })
        .eq("type", "Lost")
        .eq("status", "pending");

      if (lostError) throw lostError;
      setLostItemsPending(lostCount);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCounts();

    // Set up polling to fetch data every 5 seconds (5000 ms)
    const intervalId = setInterval(fetchCounts, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  
  useEffect(() => {
    const targetSection = localStorage.getItem("scrollToSection");

    if (targetSection) {
      const scrollToSection = () => {
        const section = document.getElementById(targetSection);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
        localStorage.removeItem("scrollToSection"); // Clear the flag
      };

      // Delay scrolling to ensure the page is fully loaded
      const scrollTimeout = setTimeout(scrollToSection, 100);

      // Clear timeout on cleanup
      return () => clearTimeout(scrollTimeout);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Use Supabase's signOut method to log the user out
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error logging out:", error.message);
      } else {
        console.log("User logged out successfully");
        // Redirect user to a specific page or refresh the page
        navigate("/login"); // For example, navigate to the login page
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error.message);
    }
  };

  // Function to handle section highlighting on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;

          if (entry.isIntersecting) {
            // Set active link to the section currently in view
            setActiveLink(sectionId);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the section is in view
    );

    // Observe all sections
    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchAuthenticatedUserUid = async () => {
      const auth = getAuth();
      const user = auth.currentUser; // Get the current authenticated user

      if (user) {
        setUid(user.uid);
      } else {
      }

      setLoading(false);
    };

    fetchAuthenticatedUserUid();
  }, []);

  // Scroll effect for fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    // Observe text and image containers
    textRefs.current.forEach((textRef) => {
      if (textRef) observer.observe(textRef);
    });

    imgRefs.current.forEach((imgRef) => {
      if (imgRef) observer.observe(imgRef);
    });

    // Observe the HomePageContent for the unique effect
    if (homepageRef.current) observer.observe(homepageRef.current);
    // Observe the ItemStatus for the fade effect
    if (itemStatusRef.current) observer.observe(itemStatusRef.current);

    return () => observer.disconnect();
  }, []);

  const handleScroll = (event) => {
    event.preventDefault(); // Prevent default scroll behavior

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastScrollTimeRef.current;

    if (timeDifference < 600) return; // Throttle scroll to 600ms

    lastScrollTimeRef.current = currentTime; // Update last scroll time

    // Get all section elements
    const sections = document.querySelectorAll(".sections > div");
    const viewportHeight = window.innerHeight;

    // Find the section currently at the top
    const currentSectionIndex = Array.from(sections).findIndex((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top >= 0 && rect.top < viewportHeight;
    });

    let nextSectionIndex;

    if (event.deltaY > 0) {
      // Scroll down
      nextSectionIndex =
        currentSectionIndex + 1 < sections.length
          ? currentSectionIndex + 1
          : currentSectionIndex;
    } else {
      // Scroll up
      nextSectionIndex =
        currentSectionIndex - 1 >= 0
          ? currentSectionIndex - 1
          : currentSectionIndex;
    }

    sections[nextSectionIndex].scrollIntoView({ behavior: "smooth" });
  };

  // Set up scroll event listener
  useEffect(() => {
    const handleWheelScroll = (e) => handleScroll(e);

    window.addEventListener("wheel", handleWheelScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleWheelScroll);
  }, []);

  useEffect(() => {
    if (!loading && uid === "4skSWo0Ld2YnIZG1hGRaNQd3Kg72") {
      navigate("/adminpage");
    }
  }, [loading, uid, navigate]);

  // Fetch notifications when user ID is available
  useEffect(() => {
    if (uid) {
      const notificationsRef = collection(db, "users", uid, "notifications");
      const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsData);
      });

      return () => unsubscribe();
    }
  }, [uid]);

  // Count the items based on their status
  const lostItemsCount = foundItems.filter(
    (item) => item.status === "lost"
  ).length;
  const pendingClaimsCount = foundItems.filter(
    (item) => item.status === "pending"
  ).length;

  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const GoToReportLostItem = () => {
    navigate("/report-lost-item"); // Navigate to /report-lost-item
  };

  const GoToReportFoundItem = () => {
    navigate("/report-found-item"); // Navigate to /report-found-item
  };

  const GoToEditReportedItem = () => {
    navigate("/edit-reported-item"); // Navigate to /edit-reported-item
  };

  return (
    <div className="homepage-main">
      <div className="navbar">
        <div className="start">
          <img src={logo} alt="NU Logo" className="logo" />
          <label>NU LOST AND FOUND DASMARIÑAS</label>
        </div>
        <div className="navs">
          <nav className="nav">
            <a
              href="#HomePage"
              className={activeLink === "HomePage" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "HomePage")}
            >
              Home
            </a>
            <a
              href="#Memo1"
              className={
                activeLink === "Memo1" || activeLink === "Memo2" ? "active" : ""
              }
              onClick={(e) => handleNavClick(e, "Memo1")}
            >
              Memorandum
            </a>
            <a
              href="#Report1"
              className={activeLink === "Report1" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "Report1")}
            >
              Report
            </a>
          </nav>
        </div>
        <img
          src={notif}
          alt="Notifications"
          className="notif"
          onClick={handleShowNotifications}
        />
      </div>

      {showNotifications && (
        <div className="notifbody">
          <h2>Notifications:</h2>
          <div className="notifScroll">
            {notifications.length === 0 ? (
              <p className="noNotificationsMessage">
                No notifications available.
              </p>
            ) : (
              notifications.map((notification) => (
                <Notification key={notification.id} data={notification} /> // Use the Notification component
              ))
            )}
          </div>
          <div className="logoutDiv">
            <button
              className="logoutBtnxd"
              id="logoutBtn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="sections">
        <div
          className="HomePage"
          id="HomePage"
          ref={(el) => (sectionRefs.current[0] = el)}
        >
          <div className="homepage-fade HomePageContent" ref={homepageRef}>
            <h1>The lost items are in DO’s hands.</h1>
            <p>
              Welcome to our page, the easy way to manage lost and found items
              on campus. Quickly report and locate missing belongings, helping
              students reconnect with their items.
            </p>
          </div>

          <div
            className="homepage-fade ItemStatus" // Applying the same effect here
            ref={itemStatusRef} // Assigning ref for ItemStatus
          >
            <div className="LostStatus">
        <h2 id="lostitems">{lostItemsPending}</h2>
        <span>Lost Items</span>
      </div>
      <div className="FoundStatus">
        <h2 id="founditems">{foundItemsPending}</h2>
        <span>Found Items</span>
            </div>
          </div>
        </div>

        <div
          className="Memo1"
          id="Memo1"
          ref={(el) => (sectionRefs.current[1] = el)}
        >
          <img
            src={Memo1Img}
            className="Memo1Img fade-content1"
            ref={(el) => (imgRefs.current[0] = el)}
          />
          <div
            className="Memo1TextContainer fade-content1"
            ref={(el) => (textRefs.current[0] = el)}
          >
            <h1>Memorandum for the Disposal of Found Items.</h1>
            <p>
              • Unclaimed property that easily decays, releases odor, or is
              perishable will be disposed of within 48 hours. Proper
              documentation, such as a picture, will be provided.
              <br />
              • Unclaimed non-perishable property will be disposed of after the
              end of the academic year.
              <br />• All items shredded or disposed of must be recorded in the
              Lost and Found Property Logbook.
            </p>
          </div>
        </div>

        <div className="Memo2">
          <div
            className="Memo2TextContainer fade-content2"
            ref={(el) => (textRefs.current[1] = el)}
          >
            <h1>Memorandum for the Claiming of Found Items.</h1>
            <p>
              • Perishable and personal items that can emit foul odor must be
              claimed within 48 hours to prevent pest infestation.
              <br />
              • Non-perishable items can be claimed at the end of the term.
              <br />
              <br />
              Items that are perishable and other personal items that can emit
              foul odor are as follows.
              <br />
              • Food and Beverages (Lunch Box, Tumbler, etc.)
              <br />
              • Personal Care Items (Toiletries, etc.)
              <br />
              • Fabric (Clothes, Lab Gown, Towel, Jacket Socks, etc.)
              <br />
              <br />
              Items that are non-perishable are as follows.
              <br />
              • Accessories
              <br />• Electronics
            </p>
          </div>
          <img
            src={Memo2Img}
            className="Memo2Img fade-content2"
            ref={(el) => (imgRefs.current[1] = el)}
          />
        </div>

        <div
          className="Report1"
          id="Report1"
          ref={(el) => (sectionRefs.current[3] = el)}
        >
          <img
            src={Report1Img}
            className="Report1Img fade-content1"
            ref={(el) => (imgRefs.current[2] = el)}
          />
          <div
            className="Report1TextContainer fade-content1"
            ref={(el) => (textRefs.current[2] = el)}
          >
            <h1>Report a Found Item.</h1>
            <p>
              When reporting a found item, please follow the necessary steps
              below to help us identify the item and the person who surrendered
              it.
              <br />
              <br />
              • Please read the Terms and Conditions.
              <br />
              • Describe the item you found.
              <br />• Fill out the Response Form.
            </p>
            <button className="ReportFoundbtn" onClick={GoToReportFoundItem}>
              Report a Found Item
            </button>
          </div>
        </div>

        <div className="Report2" id="Report2">
          <div
            className="Report2TextContainer fade-content2"
            ref={(el) => (textRefs.current[3] = el)}
          >
            <h1>Report a Missing Item.</h1>
            <p>
              When reporting a missing item, please follow the necessary steps
              below to help us identify you and check for matching items based
              on your description.
              <br />
              <br />
              • Please read the Terms and Conditions.
              <br />
              • Describe the item you lost.
              <br />• Fill out the Response Form.
            </p>
            <button className="ReportLostbtn" onClick={GoToReportLostItem}>
              Report a Missing Item
            </button>
          </div>
          <img
            src={Report2Img}
            className="Report2Img fade-content2"
            ref={(el) => (imgRefs.current[4] = el)}
          />
        </div>

        <div className="Report2" id="Report3">
          <div
            className="Report2TextContainer fade-content2"
            ref={(el) => (textRefs.current[3] = el)}
          >
            <h1>Edit your reports</h1>
            <p>
              You can update the details of your lost or found item report at
              any time. Whether it's to provide a more accurate description,
              update the item’s condition, or change your contact information,
              simply select the report you wish to edit and make the necessary
              adjustments. This helps us ensure the most up-to-date information
              is available for matching lost and found items.
            </p>
            <button className="ReportLostbtn" onClick={GoToEditReportedItem}>
              Edit or delete reports
            </button>
          </div>
          <img
            src={Report2Img}
            className="Report2Img fade-content2"
            ref={(el) => (imgRefs.current[4] = el)}
          />
        </div>

        <div className="dark-blue-footer">
          <div className="footerContent">
            <h3>Contact Us:</h3>
            <ul>
              <li>
                Email:{" "}
                <a href="mailto:nu.lostandfound.dasmarinas@gmail.com">
                  nu.lostandfound.dasmarinas@gmail.com
                </a>
              </li>
              <li>Contact No.: 0999-999-9999</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage2;
