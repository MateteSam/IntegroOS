import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Key, Save, ExternalLink } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { saveVideoAPIKeys } from '@/lib/videoAPI';
import { saveGoogleKeyToLocalStorage } from '@/lib/aiClient';

const APIKeyManager = () => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState({
    google: localStorage.getItem('GOOGLE_API_KEY') || '',
    pexels: localStorage.getItem('PEXELS_API_KEY') || '',
    elevenlabs: localStorage.getItem('ELEVENLABS_API_KEY') || '',
    runway: localStorage.getItem('RUNWAY_API_KEY') || '',
    did: localStorage.getItem('DID_API_KEY') || ''
  });

  const apiServices = [
    {
      id: 'google',
      name: 'Google Gemini',
      description: 'AI text generation, content creation',
      website: 'https://makersuite.google.com/app/apikey',
      tier: 'Free tier available',
      required: true
    },
    {
      id: 'pexels',
      name: 'Pexels',
      description: 'Stock videos and images',
      website: 'https://www.pexels.com/api/',
      tier: '200 requests/hour free',
      required: false
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      description: 'AI voice generation and text-to-speech',
      website: 'https://elevenlabs.io/',
      tier: '10k characters/month free',
      required: false
    },
    {
      id: 'runway',
      name: 'Runway ML',
      description: 'AI video generation',
      website: 'https://runwayml.com/',
      tier: 'Limited free credits',
      required: false
    },
    {
      id: 'did',
      name: 'D-ID',
      description: 'AI avatar videos',
      website: 'https://www.d-id.com/',
      tier: 'Free trial available',
      required: false
    }
  ];

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleKeyChange = (keyId: string, value: string) => {
    setKeys(prev => ({
      ...prev,
      [keyId]: value
    }));
  };

  const saveKeys = () => {
    try {
      // Save Google API key
      if (keys.google) {
        saveGoogleKeyToLocalStorage(keys.google);
      }

      // Save video API keys
      saveVideoAPIKeys({
        pexels: keys.pexels,
        elevenlabs: keys.elevenlabs,
        runway: keys.runway,
        did: keys.did
      });

      toast({
        title: "API Keys Saved",
        description: "Your API keys have been saved securely in your browser."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
          <Key className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 font-medium">API KEY MANAGER</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Configure API Services
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect your API keys to unlock the full potential of MLM Business Nexus. 
          All keys are stored securely in your browser.
        </p>
      </div>

      <div className="grid gap-6">
        {apiServices.map(service => (
          <Card key={service.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{service.tier}</Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(service.website, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${service.id}-key`}>API Key</Label>
                <div className="relative">
                  <Input
                    id={`${service.id}-key`}
                    type={showKeys[service.id] ? 'text' : 'password'}
                    value={keys[service.id as keyof typeof keys]}
                    onChange={(e) => handleKeyChange(service.id, e.target.value)}
                    placeholder={`Enter your ${service.name} API key`}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleKeyVisibility(service.id)}
                  >
                    {showKeys[service.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {keys[service.id as keyof typeof keys] && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>API key configured</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-semibold">Security Notice</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                API keys are stored locally in your browser and never sent to our servers. 
                For production use, consider using environment variables or secure key management.
              </p>
            </div>
            <Button onClick={saveKeys} className="ml-4">
              <Save className="mr-2 h-4 w-4" />
              Save All Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeyManager;