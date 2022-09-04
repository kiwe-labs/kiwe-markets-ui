import * as React from 'react';
import styled from 'styled-components';
import { Input } from 'antd';
//import SearchIcon from '@mui/icons-material/Search';

const Search = styled.div`
  position: 'relative',
  backgroundColor: '#0f1625',
  borderBottom: "2px solid #262C39 !important",
  marginRight: theme.spacing(2),
  marginLeft: 8,
  width: '100%',
  height: 64,
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },`;

const SearchIconWrapper = styled.div`
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',`;

const StyledInputBase = styled.Input`
  color: 'inherit',

    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '50ch',
    },`

export default function SearchBar({ filterText, setFilterText }) {
  return (
    
    <Search>
      <SearchIconWrapper>
        
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search ticker or name…"
        inputProps={{ 'aria-label': 'search' }}
        value={filterText}
        onChange={setFilterText}
      />
    </Search>
    
  );
}
