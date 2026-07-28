import { prisma } from "@/server/db/prisma";
import MenuEditor from "./MenuEditor";

export default async function AdminMenuPage() {
  const items = await prisma.masterNavItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <MenuEditor items={items.map((i) => ({ id: i.id, href: i.href, label: i.label }))} />
  );
}
