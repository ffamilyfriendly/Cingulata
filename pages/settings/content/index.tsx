import AuthedComponent from "@/components/AuthedComponent";
import StickyHeader from "@/components/StickyHeader";
import { UserPermissions } from "@/lib/api/managers/UserManager";

export default function Home() {
    return (
        <AuthedComponent requires={UserPermissions.ManageContent}>
            <StickyHeader title="Content" link={{ title: "Settings", href: "/settings" }} />
            <h1>cum</h1>
        </AuthedComponent>
    )
}