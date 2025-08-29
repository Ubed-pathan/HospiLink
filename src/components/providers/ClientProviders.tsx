"use client";

// Thin wrapper that uses the main Providers composition
import React from 'react';
import Providers from './Providers';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
	return <Providers>{children}</Providers>;
}
