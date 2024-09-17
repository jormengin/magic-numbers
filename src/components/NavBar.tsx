// src/components/Navbar.tsx

"use client";

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Link from 'next/link';
import { usePageTitle } from '../context/PageTitleContext'; // Import the usePageTitle hook

export default function Navbar({ mode, toggleColorMode }: { mode: string, toggleColorMode: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { title } = usePageTitle(); // Use the page title from context

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {mode === 'light' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <List>
          <ListItem button component={Link} href="/home" onClick={handleDrawerToggle}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} href="/single-player" onClick={handleDrawerToggle}>
            <ListItemText primary="Single Player" />
          </ListItem>
          {/* <ListItem button component={Link} href="/multiplayer" onClick={handleDrawerToggle}>
            <ListItemText primary="Multiplayer" />
          </ListItem> */}
        </List>
      </Drawer>
    </>
  );
}
