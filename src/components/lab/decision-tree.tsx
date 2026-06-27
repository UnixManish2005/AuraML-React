// ============================================================
// DECISION TREE LAB (Visualization)
// ============================================================

"use client";

export default function DecisionTreeLab() {
  return (
    <div className="p-6">
      <h2 className="font-semibold text-lg mb-2">Decision Tree</h2>
      <p className="text-sm text-muted-foreground mb-6">Visual decision tree builder — coming soon with full interactivity</p>

      {/* Static tree visualization */}
      <div className="flex flex-col items-center gap-0">
        {/* Root */}
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          Age &gt; 25?
        </div>
        <div className="flex gap-32 items-start mt-0">
          <div className="flex flex-col items-center">
            <div className="w-px h-8 bg-border" />
            <div className="text-xs text-muted-foreground mb-1">Yes</div>
            <div className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Income &gt; 50K?
            </div>
            <div className="flex gap-12 mt-0">
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-border" />
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs">✓ Approve</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-border" />
                <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs">✗ Reject</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-px h-8 bg-border" />
            <div className="text-xs text-muted-foreground mb-1">No</div>
            <div className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Score &gt; 700?
            </div>
            <div className="flex gap-12 mt-0">
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-border" />
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs">✓ Approve</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-border" />
                <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs">✗ Reject</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">📚 Key Concepts</h3>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div><strong className="text-foreground">Gini Impurity</strong><p className="mt-1">Measures how often a randomly chosen element would be incorrectly labeled</p></div>
          <div><strong className="text-foreground">Information Gain</strong><p className="mt-1">How much entropy is reduced after a split on a feature</p></div>
          <div><strong className="text-foreground">Pruning</strong><p className="mt-1">Removing branches that have little predictive power to prevent overfitting</p></div>
        </div>
      </div>
    </div>
  );
}
