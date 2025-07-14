import React from 'react';
import { Link2, Plus, Layers } from 'lucide-react';
import ChainListPanel from './ChainListPanel';
import HybridChainEditorView from './HybridChainEditorView';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const ChainManagerView: React.FC = () => {
  const [selectedChainId, setSelectedChainId] = React.useState<number | null>(null);

  const handleChainSelected = (id: number) => {
    // Handle clear selection signal
    if (id === -1) {
      setSelectedChainId(null);
    } else {
      setSelectedChainId(id);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Left Sidebar - Chain List */}
      <div className="w-96 min-w-80 max-w-[500px] border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Link2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Chain Manager</h1>
            </div>
            <Button size="sm" className="no-drag">
              <Plus className="w-4 h-4 mr-1" />
              New Chain
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-80px)] scrollbar-thin">
          <ChainListPanel 
            onSelectChain={handleChainSelected} 
            selectedChainId={selectedChainId}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-background">
        {selectedChainId ? (
          <HybridChainEditorView chainId={selectedChainId} />
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Link2 className="w-8 h-8 text-primary/70" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Chain Manager</h2>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Select a chain from the sidebar to start editing, or create a new chain to get started.
                </p>
              </div>
              
              <div className="grid gap-4 mt-8">
                <Card className="text-left">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Layers className="w-4 h-4 mr-2" />
                      Chain Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">
                      Create and manage chain workflows with seamless panel transitions and modern UI.
                    </CardDescription>
                  </CardContent>
                </Card>
                
                <Card className="text-left">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">
                      Powerful tools for creating and managing your SnipChain workflows.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainManagerView;
