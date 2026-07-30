import professionalModel from "../models/professionalModel.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary if keys are provided
if (
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_SECRET_KEY
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
}

/**
 * Haversine formula to compute distance (in km) between two coordinates.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GET /api/professional/list
 * Public: list/search professionals with filters for category, minRating, and location radius.
 */
export const listProfessionals = async (req, res) => {
  try {
    const { category, minRating, lat, lng, radiusKm, verificationStatus } = req.query;

    const query = {
      isActive: true,
      // Default to approved professionals unless specifically requested otherwise
      verificationStatus: verificationStatus || "approved",
    };

    if (category) {
      query.categories = category;
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    let professionals = await professionalModel
      .find(query)
      .populate("user", "-password")
      .populate("categories");

    // Filter by location radius using Haversine distance if lat, lng, and radiusKm are provided
    if (lat && lng && radiusKm) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const maxRadius = Number(radiusKm);

      professionals = professionals.filter((pro) => {
        if (!pro.serviceArea || pro.serviceArea.lat == null || pro.serviceArea.lng == null) {
          // If pro hasn't set location coordinates, include them by default
          return true;
        }
        const dist = haversineDistance(
          userLat,
          userLng,
          pro.serviceArea.lat,
          pro.serviceArea.lng
        );
        return dist <= maxRadius;
      });
    }

    res.json({ success: true, count: professionals.length, professionals });
  } catch (error) {
    console.error("listProfessionals error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/professional/:id
 * Public: fetch single professional profile.
 */
export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await professionalModel
      .findById(id)
      .populate("user", "-password")
      .populate("categories");

    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional profile not found." });
    }

    res.json({ success: true, professional });
  } catch (error) {
    console.error("getProfessionalById error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/professional/availability
 * authPro-gated: update weekly availability schedule.
 */
export const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability || typeof availability !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Valid availability object is required." });
    }

    const professional = await professionalModel.findOne({ user: req.userId });
    if (!professional) {
      return res
        .status(404)
        .json({ success: false, message: "Professional profile not found for logged in user." });
    }

    professional.availability = availability;
    await professional.save();

    res.json({ success: true, availability: professional.availability });
  } catch (error) {
    console.error("updateAvailability error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/professional/active
 * authPro-gated: toggle or update isActive status.
 */
export const toggleActive = async (req, res) => {
  try {
    const professional = await professionalModel.findOne({ user: req.userId });
    if (!professional) {
      return res
        .status(404)
        .json({ success: false, message: "Professional profile not found for logged in user." });
    }

    if (req.body.isActive !== undefined) {
      professional.isActive = Boolean(req.body.isActive);
    } else {
      professional.isActive = !professional.isActive;
    }

    await professional.save();

    res.json({ success: true, isActive: professional.isActive });
  } catch (error) {
    console.error("toggleActive error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/professional/documents
 * authPro-gated: upload document to Cloudinary and attach URL to professional profile.
 */
export const uploadDocuments = async (req, res) => {
  try {
    const professional = await professionalModel.findOne({ user: req.userId });
    if (!professional) {
      return res
        .status(404)
        .json({ success: false, message: "Professional profile not found for logged in user." });
    }

    let documentUrl = "";

    if (req.file) {
      if (
        process.env.CLOUDINARY_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_SECRET_KEY
      ) {
        // Upload to Cloudinary using stream
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "home_services_documents",
          resource_type: "auto",
        });
        documentUrl = result.secure_url;
      } else {
        // Fallback placeholder URL when Cloudinary keys are not set
        documentUrl = `https://placeholder.docs/doc_${Date.now()}_${req.file.originalname}`;
      }
    } else if (req.body.documentUrl) {
      documentUrl = req.body.documentUrl;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "File upload or documentUrl is required." });
    }

    professional.documents.push(documentUrl);
    await professional.save();

    res.json({ success: true, documents: professional.documents });
  } catch (error) {
    console.error("uploadDocuments error:", error);
    res.status(500).json({ success: false, message: "Server error during document upload." });
  }
};
