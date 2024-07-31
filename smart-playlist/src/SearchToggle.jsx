function SearchToggle({ f, highlight, text }) {
	return (
        <div>
            <button className={`searchToggle-button ${highlight ? 'primary' : 'secondary'}`} onClick={f}>{text}</button>
        </div>
	)
}

export default SearchToggle
