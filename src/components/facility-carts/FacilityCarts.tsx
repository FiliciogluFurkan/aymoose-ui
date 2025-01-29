import "src/components/facility-carts/FacilityCarts.css";
import { useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import { Facility } from "@/interfaces/Facility";

interface FacilityCartProps {
  facility: Facility;
}

const FacilityCarts = ({ facility }: FacilityCartProps): JSX.Element => {
  const fieldId = facility.id;
  console.log(facility);

  const [isFavorited, setIsFavorited] = useState(false);









  const handleFavoriteToggle = async () => {
    const newFavoriteStatus = !isFavorited;

    try {
      const response = newFavoriteStatus
        ? await axios.post(`/api/favorites/${fieldId}`)
        : await axios.delete(`/api/favorites/${fieldId}`);

      if (response.status === 200) {
        setIsFavorited(newFavoriteStatus);
        console.log(
          `Court ID ${fieldId} favorilere ${newFavoriteStatus ? "eklendi" : "silindi"
          }.`
        );
      } else {
        console.error("Favori işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <Box
      sx={{
        width: "60vw",
        height: "14rem",
        marginLeft: "2rem",
        display: "flex",
        flexDirection: "row",
        marginTop: "1rem",
      }}
    >
      <Box sx={{ flex: "0 0 auto" }}>
        <img
          src={facility.imageUrls[0] || "/images/placeholder.png"}
          style={{
            width: "15rem",
            height: "13rem",
            borderRadius: "0.8rem",
            objectFit: "cover",
            margin: "0.5rem 0 0 0.8rem",
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "1rem 1.5rem",
          height: "100%",
        }}
      >
        <Box
          sx={{
            height: "1.5rem",
            fontSize: "0.9rem",
            fontFamily: "Roboto",
            color: "rgb(107, 114, 128)",
            marginBottom: "0.5rem",
          }}
        >
          <span>
            {" "}
            {facility.city} / {facility.district}
          </span>
        </Box>

        <Box
          sx={{
            height: "2rem",
            fontSize: "1.4rem",
            fontWeight: 400,
            fontFamily: "Roboto",
            color: "rgb(55, 65, 81)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          {facility.name.toString()}
        </Box>

        {/*   <hr
          style={{
            width: "4rem",
            border: "none",
            borderTop: "1px solid rgb(229, 231, 235)",
            margin: "0 0 1rem 0",
            padding: 0,
            height: 0,
          }}
        /> */}
        <Box
          sx={{ display: "flex", flexDirection: "row", }}
        >
          {facility.amenities.map((amenity: { name: string; id: string; imageUrl: string },) => (

            <img
              src={amenity.imageUrl || "/images/placeholder.png"}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "0.3rem",
                objectFit: "cover",
                margin: "0.3rem 0.3rem 0.3rem 0.3rem",
              }}
            />
          ))}
        </Box>

        <Box
          sx={{ display: "flex", flexDirection: "row", marginTop: "0.6rem" }}
        >
          {facility.capacities.map((capacity) => (
            <Box sx={{
              width: "1.5rem",
              height: "1.5rem",
              textAlign: "center",
              fontFamily: "Roboto",
              fontSize: "15px",
              minWidth: "3rem",
              margin: "0.3rem 0 0 0.5rem",
            }} >
              {capacity / 2}+{capacity / 2}
            </Box>

          ))}
        </Box>

        {/*
        <hr
          style={{
            width: "4rem",
            border: "none",
            borderTop: "1px solid rgb(229, 231, 235)",
            margin: "0 0 1rem 0",
            padding: 0,
            height: 0,
          }}
        />*/}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "auto",
          }}
        >
          <Box
            sx={{
              fontSize: "1rem",
              fontFamily: "Roboto",
              color: "rgb(55, 65, 81)",
              width: "2rem",
              textAlign: "center",
            }}
          >
            {facility.rating}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "20px",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#f59e0b"
              stroke="rgb(252, 211, 77)"
              strokeWidth="1"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            </svg>
          </Box>

          <Box
            sx={{
              fontSize: "0.9rem",
              color: "rgb(55, 65, 81)",
              width: "7rem",
              fontFamily: "Roboto",
            }}
          >
            {facility.reviewCount} Yorum
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "15rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1rem",
          marginLeft: "1rem",
          marginRight: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={handleFavoriteToggle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorited ? "#FDA4AF" : "none"}
            stroke="rgb(55, 65, 81)"
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: "1rem",
              fontFamily: "inter",
              fontWeight: 500,
              color: "rgb(55, 65, 81)",
              marginRight: "0.2rem",
            }}
          >
            {facility.lowerPriceLimit} - {facility.upperPriceLimit} TL
          </Box>
          <Box
            component="span"
            sx={{
              fontFamily: "inter",
              fontWeight: 400,
              fontSize: "1rem",
              color: "rgb(55, 65, 81)",
            }}
          >
            / Saat
          </Box>
        </Box>

      </Box>
   

    </Box>
  );
};

export default FacilityCarts;
