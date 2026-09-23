"use client";

interface Props {
  customerName: string;
  structuredData: unknown;
}

export default function DownloadPackageButton({ customerName, structuredData }: Props) {
  function handleDownload() {
    const blob = new Blob([JSON.stringify(structuredData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = customerName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `${slug || "config-package"}-sourcing-intake.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Download structured data (JSON)
    </button>
  );
}
