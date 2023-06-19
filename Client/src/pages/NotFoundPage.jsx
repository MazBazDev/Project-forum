import React from "react";
import "./css/notfound.css"
class NotFoundPage extends React.Component {
	render() {
		return (
			<div className="notFound">
				<h1>404</h1>
				<p>Oops! Something is wrong.</p>
				<a class="notFoundbutton" href="/">
					<i class="icon-home"></i> Go back in initial page, is better.
				</a>
			</div>
		);
	}
}

export default NotFoundPage;
