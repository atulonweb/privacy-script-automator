
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Website } from '@/hooks/useWebsites';
import { toast } from 'sonner';

interface ScriptCodeProps {
  scriptId: string;
  website: Website | undefined;
}

const ScriptCode: React.FC<ScriptCodeProps> = ({ scriptId, website }) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const navigate = useNavigate();

  const handleCopyScript = () => {
    const scriptCode = `<script src="https://cdn.consentguard.com/cg.js?id=${scriptId}" async></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    toast.success("Script code copied to clipboard");
    
    setTimeout(() => {
      setCopiedScript(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Your Consent Script</h3>
        <p className="text-sm text-muted-foreground">
          Add this script to your website's &lt;head&gt; tag.
        </p>
      </div>

      <div>
        {website && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <p className="font-medium">{website.name}</p>
            <p className="text-sm text-muted-foreground">{website.domain}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
          {`<script src="https://cdn.consentguard.com/cg.js?id=${scriptId}" async></script>`}
        </div>

        <Button 
          onClick={handleCopyScript} 
          variant="outline" 
          className="mt-4 w-full"
        >
          {copiedScript ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy Script
            </>
          )}
        </Button>
      </div>

      <div className="pt-4">
        <Button 
          className="bg-brand-600 hover:bg-brand-700" 
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ScriptCode;
