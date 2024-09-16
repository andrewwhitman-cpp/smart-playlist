import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { Container } from '@mui/material';

const options = [
	'Select Sorting Type',
	'Smart Sort',
	'Alphabetically - Song',
	'Alphabetically - Artist'
];

const sortType = [
	'none',
	'smart',
	'alphaSong',
	'alphaArtist'
]

export default function BasicMenu(props) {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const open = Boolean(anchorEl);
	const handleClickListItem = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuItemClick = (event, index) => {
		setSelectedIndex(index);
		setAnchorEl(null);
		props.f(sortType[index])
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Container sx={{
			display: 'flex',
			justifyContent: 'center'
		}} >
			<List
				component="nav"
				aria-label="Device settings"
				sx={{ bgcolor: 'background.paper' }}
			>
				<ListItemButton
					id="lock-button"
					aria-haspopup="listbox"
					aria-controls="lock-menu"
					aria-label="when device is locked"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClickListItem}
					sx={{
						border: 1,
						borderRadius: 2,
						bgcolor: 'primary.main',
						borderColor: 'primary.main',
						":hover": { backgroundColor: 'primary.dark', borderColor: 'primary.dark' },
						color: 'background.default',
						textAlign: 'center',
					}}
				>
					<ListItemText sx={{ m: 0, px: 3 }}
						primary={options[selectedIndex]}
					// secondary="Other text"
					/>
				</ListItemButton>
			</List>
			<Menu
				id="lock-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'lock-button',
					role: 'listbox',
				}}
			>
				{options.map((option, index) => (
					<MenuItem
						key={option}
						// disabled={index === 3}
						selected={index === selectedIndex}
						onClick={(event) => handleMenuItemClick(event, index)}
					>
						{option}
					</MenuItem>
				))}
			</Menu>
		</Container>
	);
}
