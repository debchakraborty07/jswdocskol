import { db, storage } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

const NOTICES_COLLECTION = "department_notices";

/**
 * Uploads a screenshot or notice photo to Firebase Storage
 * @param {File} file
 * @returns {Promise<string>} Download URL
 */
export async function uploadNoticeImage(file) {
    if (!file) return "";
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `notices/${Date.now()}_${sanitizedFileName}`;
    const fileRef = ref(storage, storagePath);

    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
}

/**
 * Creates and publishes a new departmental announcement/notice
 * @param {string} title
 * @param {string} description
 * @param {File|null} imageFile
 * @param {string} authorName
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function createNotice(title, description, imageFile = null, authorName = "Admin") {
    try {
        let imageUrl = "";

        // Upload attachment if user selected an image/screenshot
        if (imageFile) {
            imageUrl = await uploadNoticeImage(imageFile);
        }

        await addDoc(collection(db, NOTICES_COLLECTION), {
            title,
            description,
            imageUrl,
            authorName,
            createdAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to create notice:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches all department notices ordered from newest to oldest
 * @returns {Promise<Array>}
 */
export async function fetchNotices() {
    try {
        const q = query(
            collection(db, NOTICES_COLLECTION),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const notices = [];

        snapshot.forEach((d) => {
            const data = d.data();
            notices.push({
                id: d.id,
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                authorName: data.authorName,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            });
        });

        return notices;
    } catch (error) {
        console.error("Failed to fetch notices:", error);
        return [];
    }
}

/**
 * Deletes a notice and its associated image from Storage
 * @param {string} noticeId
 * @param {string} imageUrl
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deleteNotice(noticeId, imageUrl = "") {
    try {
        // Delete Firestore document
        await deleteDoc(doc(db, NOTICES_COLLECTION, noticeId));

        // Delete image from Firebase Storage if URL exists
        if (imageUrl && imageUrl.includes("firebasestorage")) {
            try {
                const fileRef = ref(storage, imageUrl);
                await deleteObject(fileRef);
            } catch (storageErr) {
                console.warn("Could not delete image file from storage:", storageErr);
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete notice:", error);
        return { success: false, error: error.message };
    }
}