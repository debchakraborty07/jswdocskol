import { db, storage } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

const COLLECTION_NAME = "department_announcements";

/**
 * Extracts pure internal Storage Path from Firebase HTTPS download URL
 * Example: ".../o/announcements%2Fsample.png?alt=media..." -> "announcements/sample.png"
 */
function extractStoragePath(downloadUrl = "") {
    try {
        const marker = "/o/";
        const startIndex = downloadUrl.indexOf(marker);
        if (startIndex === -1) return null;

        const queryIndex = downloadUrl.indexOf("?", startIndex);
        const encoded = queryIndex !== -1
            ? downloadUrl.substring(startIndex + marker.length, queryIndex)
            : downloadUrl.substring(startIndex + marker.length);

        return decodeURIComponent(encoded);
    } catch (err) {
        return null;
    }
}

/**
 * Uploads up to 4 images to Firebase Storage
 */
export async function uploadAnnouncementImages(fileList = []) {
    const uploadedUrls = [];

    for (const file of fileList) {
        if (!file) continue;
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storagePath = `announcements/${Date.now()}_${sanitizedName}`;
        const fileRef = ref(storage, storagePath);

        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        uploadedUrls.push(downloadUrl);
    }

    return uploadedUrls;
}

/**
 * Creates an announcement (published or draft)
 */
export async function saveAnnouncement({
    title,
    description,
    images = [],
    authorName = "Admin",
    isDraft = false,
}) {
    try {
        const imageUrls = await uploadAnnouncementImages(images);

        await addDoc(collection(db, COLLECTION_NAME), {
            title: title.trim(),
            description: description.trim(),
            imageUrls,
            authorName,
            status: isDraft ? "draft" : "published",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Fetches published announcements for Homepage
 */
export async function fetchPublishedAnnouncements() {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("status", "==", "published"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
        return list;
    } catch (error) {
        return [];
    }
}

/**
 * Fetches draft announcements
 */
export async function fetchDraftAnnouncements() {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("status", "==", "draft"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
        return list;
    } catch (error) {
        return [];
    }
}

/**
 * Publishes a draft
 */
export async function publishDraft(docId) {
    try {
        const docRef = doc(db, COLLECTION_NAME, docId);
        await updateDoc(docRef, {
            status: "published",
            publishedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Deletes announcement record AND completely purges all images from Storage bucket
 */
export async function deleteAnnouncementRecord(docId, imageUrls = []) {
    try {
        // 1. Delete Firestore database document
        await deleteDoc(doc(db, COLLECTION_NAME, docId));

        // 2. Erase each image file directly from Firebase Storage bucket
        for (const url of imageUrls) {
            const storagePath = extractStoragePath(url);
            if (storagePath) {
                try {
                    const fileRef = ref(storage, storagePath);
                    await deleteObject(fileRef);
                } catch (storageErr) {
                    // Ignores if already deleted
                }
            }
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}