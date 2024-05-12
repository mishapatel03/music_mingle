import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MusicContext } from "../Context";

const Navbar = ({ keyword, handleKeyPress, setKeyword, fetchMusicData }) => {
  const musicContext = useContext(MusicContext);
  const setResultOffset = musicContext.setResultOffset;
  const navigate = useNavigate();
  const location = useLocation();
  const [isActiveHome, setActiveHome] = useState(false);

  const handleLogOut = () => {
    localStorage.clear();
    navigate('/login');
  }

  useEffect(() => {
    if (location?.pathname === '/') {
      setActiveHome(true);
    } else {
      setActiveHome(false);
    }
  }, [location])


  return (
    <>
      <nav className="navbar navbar-dark navbar-expand-lg sticky-top navbar-custom">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <i className="bi bi-music-note-list mx-3"></i> Music-Mingle
          </Link>
          <div
            className="collapse navbar-collapse d-flex justify-content-center"
            style={{ marginLeft: '-2.3%' }}
            id="navbarSupportedContent"
          >
            {isActiveHome && (
              <React.Fragment>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={handleKeyPress}
                  className="form-control me-2 w-75"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  style={{ background: '#f8edf1' }}
                />
                <button
                  onClick={() => {
                    setResultOffset(0);
                    fetchMusicData();
                  }}
                  className="btn btn-outline-light"
                >
                  <i className="bi bi-search"></i>
                </button>
              </React.Fragment>
            )}

            <button
              onClick={() => {
                handleLogOut()
              }}
              className="btn btn-outline-light"
              style={{
                position: 'relative',
                left: isActiveHome ? '7%' : '46%'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
