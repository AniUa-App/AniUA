// Web entry point — replaces index.js on web platform
// Skips notification/download setup that is Android-only
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
