function Header(props) {
	return (
		<header className="header">
			<h1 className="header-title">
				Smart Playlist Sorter
			</h1>
			<h4 className="header-text">
				Logged in as {props.user ? props.user : "Nobody"}
			</h4>
			{/* <nav className="header-nav">
				<ul>
					<li><a href='#'>Home</a></li>
					<li><a href='#'>About</a></li>
					<li><a href='#'>Services</a></li>
					<li><a href='#'>Contact</a></li>
				</ul>
			</nav> */}
			<hr></hr>
		</header>
	)
}

export default Header
