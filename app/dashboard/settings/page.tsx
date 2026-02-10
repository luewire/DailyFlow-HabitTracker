import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="py-6">
            <div className="text-center py-20">
                <Settings size={48} className="mx-auto mb-4 opacity-60" style={{ color: 'var(--text-primary)' }} />
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Settings
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Coming soon
                </p>
            </div>
        </div>
    );
}
