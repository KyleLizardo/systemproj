import "../styling/homepage2.css";

const Home2 = () => {
  return (
    <section id="1">
      <div className="homepage-main">
        <div className="body1">
          <div className="paragraphs">
            <h1 id="h1">The lost items are in DO’s hands.</h1>
            <p id="h2">
              Welcome to our page, the easy way to manage lost and found items
              on campus. Quickly report and locate missing belongings, helping
              students reconnect with their items.
            </p>
          </div>
          <hr />
          <div className="infocount">
            <div className="lostitems">
              <h1 id="lostitemcount">99</h1>
              <p>Lost Items</p>
            </div>
            <div className="founditems">
              <h1 id="founditemscount">99</h1>
              <p>Found Items</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home2;
