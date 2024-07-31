function SearchToggle({ f, text }) {
	return (
        <div>
            <button className='searchToggle-button' onClick={f}>{text}</button>
        </div>
	)
}

export default SearchToggle
