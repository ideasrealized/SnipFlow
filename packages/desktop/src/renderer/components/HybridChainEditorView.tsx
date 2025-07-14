import React, { useEffect, useState, useCallback } from 'react';
import { Save, Settings, Eye, Pin, PinOff } from 'lucide-react';
import type { Chain, ChainOption } from '../../types'; // Import ChainOption
import ChainOptionsEditor from './ChainOptionsEditor'; // New component
import ChainVisualizerMiniMap from './ChainVisualizerMiniMap';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';

interface HybridChainEditorViewProps {
  chainId: number;
}

// Assuming window.api is typed via global declaration in another file (e.g., ChainListPanel.tsx or a central types file)

const HybridChainEditorView: React.FC<HybridChainEditorViewProps> = ({ chainId }) => {
  const [chain, setChain] = useState<Chain | null>(null);
  const [chainName, setChainName] = useState<string>('');
  const [chainDescription, setChainDescription] = useState<string>('');
  // const [chainTags, setChainTags] = useState<string[]>([]); // For later tag editing
  const [options, setOptions] = useState<ChainOption[]>([]); // Changed from nodes
  const [isPinned, setIsPinned] = useState<boolean>(false); // << NEW STATE for pinned status
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  const fetchChainDetails = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new getChainById method
      const fetchedChain = await window.api.getChainById(id);

      if (fetchedChain) {
        setChain(fetchedChain);
        setChainName(fetchedChain.name);
        setChainDescription(fetchedChain.description || '');
        setOptions(fetchedChain.options || []); // Changed from fetchedChain.nodes
        setIsPinned(fetchedChain.isPinned || false); // FIXED: fetchedChain.pinned to fetchedChain.isPinned
        setInitialLoadComplete(true);
        // setChainTags(fetchedChain.tags || []);
      } else {
        throw new Error(`Chain with ID ${id} not found.`);
      }
    } catch (err: any) {
      console.error(`Error fetching chain ${id}:`, err);
      setError(err.message || 'Failed to fetch chain details');
      setChain(null);
      setOptions([]); // Clear options on error
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (chainId) {
      fetchChainDetails(chainId);
    }
  }, [chainId, fetchChainDetails]);

  const handleSaveChanges = async () => {
    if (!chain) {
      setError('No chain loaded to save.');
      return;
    }
    if (!chainName.trim()) {
      setError('Chain name cannot be empty.');
      return;
    }
    
    if (!initialLoadComplete) return; // Don't save if initial data hasn't loaded

    setIsSaving(true);
    setError(null);
    try {
      // Log arguments before sending via IPC (NEW ORDER)
      const chainToSave: Partial<Omit<Chain, 'id'>> = {
        name: chainName.trim(),
        options: options,
        description: chainDescription.trim(),
        isPinned: isPinned,
      };

      if (chain.tags) {
        chainToSave.tags = chain.tags;
      }
      if (chain.layoutData) {
        chainToSave.layoutData = chain.layoutData;
      }

      console.log(`[HybridChainEditorView] About to call window.api.updateChain with:`);
      console.log(`  ID: ${chain.id} (type: ${typeof chain.id})`);
      console.log(`  Data:`, JSON.parse(JSON.stringify(chainToSave)));

      // Construct the updated chain data with the new options structure
      await window.api.updateChain(
        chain.id, // ID is FIRST
        chainToSave
      );
      // alert('Chain saved successfully!'); // REMOVED: This can disrupt focus
      // Optionally, provide a gentler feedback mechanism here, like a temporary status message
      console.log('[HybridChainEditorView] Chain saved successfully via API.'); // For now, just log

      // Optionally re-fetch to confirm, or rely on local state being source of truth post-save
      // fetchChainDetails(chain.id); 
    } catch (err: any) {
      console.error('Error saving chain:', err);
      setError(err.message || 'Failed to save chain');
    }
    setIsSaving(false);
  };
  
  // Callback for ChainOptionsEditor to update options state
  const handleOptionsChange = (newOptions: ChainOption[]) => {
    setOptions(newOptions);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chain details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !chain) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-error-600 dark:text-error-400">Error: {error}</p>
        </div>
      </div>
    );
  }
  
  if (!chain) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a chain to view its details.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with chain metadata */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Edit Chain</h1>
                <p className="text-sm text-muted-foreground">ID: {chain.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPinned(!isPinned)}
                className={cn(isPinned && "bg-primary/10 border-primary/20")}
              >
                {isPinned ? (
                  <><PinOff className="w-4 h-4 mr-1" />Unpin</>
                ) : (
                  <><Pin className="w-4 h-4 mr-1" />Pin</>
                )}
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving || isLoading}
                className="no-drag"
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save Chain'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="chainName" className="text-sm font-medium">Chain Name</label>
              <Input
                id="chainName"
                value={chainName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChainName(e.target.value)}
                placeholder="Enter chain name..."
                className="no-drag"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="chainDescription" className="text-sm font-medium">Description</label>
              <Textarea
                id="chainDescription"
                value={chainDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChainDescription(e.target.value)}
                placeholder="Enter chain description..."
                className="no-drag min-h-[60px]"
              />
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
              <p className="text-sm text-error-600 dark:text-error-400">Error during save: {error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main content area with options editor and visualizer */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Chain Options
                </CardTitle>
                <CardDescription>
                  Configure the options and actions for this chain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChainOptionsEditor
                  key={chain?.id || 'no-chain-selected'}
                  initialOptions={options}
                  onOptionsChange={handleOptionsChange}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="w-80 border-l border-border bg-card/30 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Chain Visualizer
                </CardTitle>
                <CardDescription>
                  Visual representation of your chain structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChainVisualizerMiniMap 
                  currentChainOptions={options} 
                  currentChainName={chainName} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridChainEditorView; 