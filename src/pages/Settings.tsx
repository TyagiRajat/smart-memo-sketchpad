
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const handleSaveSettings = () => {
    // In a real app, this would save to user preferences
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-medium">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle dark theme for the application
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-medium">Notifications</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about your notes
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-medium">Note Preferences</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save" className="text-base">Auto Save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save notes while typing
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ai-suggestions" className="text-base">AI Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered suggestions for your notes
              </p>
            </div>
            <Switch
              id="ai-suggestions"
              checked={aiSuggestions}
              onCheckedChange={setAiSuggestions}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
