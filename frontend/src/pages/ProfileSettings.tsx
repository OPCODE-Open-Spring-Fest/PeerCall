import React, { useState } from "react";
import {AvatarUpload} from "../components/AvatarUpload.js";

export default function ProfileSettings() {
    const userId = "123"; // your authenticated user
    const [avatar, setAvatar] = useState<string | null>(null);

    return (
        <div style={{ padding: 20 }}>
            <h2>Profile Settings</h2>

            <AvatarUpload
                userId={userId}
                initialAvatar={avatar}
                defaultChoices={["robot1", "robot2", "robot3"]}
                onUpdated={(newAvatar) => setAvatar(newAvatar)}
            />
        </div>
    );
}
