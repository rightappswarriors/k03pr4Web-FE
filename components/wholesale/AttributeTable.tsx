import type { ProductAttribute } from "@/types/wholesale";

type AttributeTableProps = {
  attributes: ProductAttribute[];
  title?: string;
};

export default function AttributeTable({ attributes, title = "Specifications" }: AttributeTableProps) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      <table className="w-full text-sm">
        <tbody>
          {attributes.map((attr, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-slate-50" : ""}>
              <td className="w-1/3 px-4 py-3 font-medium text-slate-500">{attr.name}</td>
              <td className="px-4 py-3 text-slate-900">{attr.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}