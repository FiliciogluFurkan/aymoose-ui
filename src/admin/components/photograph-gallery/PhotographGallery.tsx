import React, { useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Typography,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import axios from "axios";
import { useEffect } from "react";
import { Facility } from "@/interfaces/Facility";
import { useAuth } from 'react-oidc-context';
import { getIdFromToken } from "@/services/DecodedJwt";

const PhotographGallery = (): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [facility, setFacility] = useState<Facility>();


  const apiUrl = import.meta.env.VITE_API_URL;
  const authState = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setShowSaveButton(true);
      console.log("File selected:", event.target.files[0]);
    }
  };


  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const facilityResponse = await axios.get(
          `${apiUrl}/api/v1/facilities?userId=${
            getIdFromToken(authState.user?.access_token).sub
          }`,
          {}
        );

        // Gelen veriyi formData'ya set et
        if (facilityResponse.data && facilityResponse.data.length > 0) {
          setFacility(facilityResponse.data[0]);
          setImageUrls(facilityResponse.data[0].imageUrls);
        }
        console.log(facilityResponse);
        console.log(facility);
      } catch (err) {
        console.error('Error fetching facilities:', err);
      }
    };
    fetchFacility();
  }, []);


  const handleSave = async () => {
    if (!selectedFile) {
        console.error("No file selected");
        return;
    }

    const formData = new FormData();
    formData.append('images', selectedFile);
    formData.append('data', new Blob([JSON.stringify(facility)], { type: 'application/json' }));

    try {
        const response = await axios.patch(`${apiUrl}/api/v1/facilities/${facility?.id}`, formData, {
            headers: {
                Authorization: `Bearer ${authState.user?.access_token}`,
                'Accept': 'application/json',
            },
        });

        console.log(response);
        imageUrls.push(response.data.url);

    } catch (error) {
        console.error('Error saving edited facility:', error);
    }
};



  return (
    <Card>
      <CardHeader title="Fotoğraf Galerisi" />
      <CardContent>
        <Grid container spacing={2}>
          {imageUrls.map((url, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="#e0e0e0"
                height={150}
                borderRadius={2}
                sx={{ cursor: "pointer" }}
              >
                <img
                  src={url}
                  alt={`Uploaded ${index}`}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </Box>
            </Grid>
          ))}
          <Grid item xs={6} md={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgcolor="#e0e0e0"
              height={150}
              borderRadius={2}
              sx={{ cursor: "pointer" }}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <Upload />
            </Box>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Grid>
        </Grid>
        {showSaveButton && (
          <Box mt={2}>
            <Typography variant="body1">
              Seçilen Dosya: {selectedFile?.name}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Kaydet
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotographGallery;
