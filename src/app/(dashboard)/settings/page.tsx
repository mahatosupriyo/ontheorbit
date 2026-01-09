import { auth } from "@/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/auth";
import { eq } from "drizzle-orm";
import styles from "./settings.module.scss";
import { ProfileForm } from './settingsform/profileform'
import AvatarUpload from "@/app/(dashboard)/avatarupload/avatarupload"
import { getAvatarUrl } from "@/server/utils/awsavatarsigner";

export default async function ProfileSettingsPage() {
    const session = await auth();
    if (!session?.user) return <div>Please log in</div>;

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user) return <div>User not found</div>;

    const secureAvatarUrl = getAvatarUrl(user?.image ?? null);

    return (
        <div className={styles.container}>

            {/* Main Content */}
            <main className={styles.mainContent}>

                {/* THE 3-COLUMN GRID LAYOUT */}
                <div className={styles.profileGrid}>

                    {/* Column 1: Avatar (Left) */}
                    <div className={styles.leftCol}>
                        <span className={styles.avatarLabel}>Photo</span>
                        <AvatarUpload initialUrl={secureAvatarUrl} />
                    </div>

                    {/* Column 2: Form (Center) */}
                    <div className={styles.centerCol}>
                        <ProfileForm user={user} />
                    </div>

                    {/* Column 3: Blank (Right) */}
                    <div className={styles.rightCol}></div>

                </div>
            </main>
        </div>
    );
}