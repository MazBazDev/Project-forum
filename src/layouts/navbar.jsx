import React from "react";
import { Link } from "react-router-dom";
import NeedAuth, { GetUser } from "../helpers.js";
import Profile from "../pages/auth/Profile.jsx";

class Navbar extends React.Component {
	render() {
		return (
			<>
			<div id="container-header">
				<div id="container-textheader">
					<a href="/" className="titleheader">CiTopics</a>
				</div>

				<NeedAuth defaults={
				<div id="container-allbutonheader">
					<div id="container-buttonlogin">
						<a className="buttonlogin">
							<div className="textbutton"><Link to="/register">REGISTER</Link></div>
						</a>
					</div>
					<div id="container-buttonlogin">
						<a className="buttonlogin">
							<div className="textbutton"><Link to="/login">LOGIN</Link></div>
						</a>
					</div>
				</div>
				}/>
				<NeedAuth auth={
					<div id="container-buttonprofil">
						<div className="butonprofil">
						{GetUser() && GetUser().profile_picture && (
							<Profile src={GetUser().profile_picture} />
						)}
						</div>
					</div>
				}/>
				
			</div>
			
			</>
		);
	}
}

export default Navbar;
