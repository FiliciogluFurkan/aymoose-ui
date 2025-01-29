import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Grid, Box, Typography, TextField, Button, Snackbar, Alert} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { styled } from '@mui/system';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import { Facility } from '@/interfaces/Facility';
import { getIdFromToken } from '@/services/DecodedJwt';

const Input = styled('input')({
  display: 'none',
});

const CourtServices = (): JSX.Element => {
  const [features, setFeatures] = useState<{ id:string,imageUrl: string; name: string }[]>([]);
  const [newFeature, setNewFeature] = useState({imageUrl: "", name: "" });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [facility, setFacility] = useState<Facility>();
  const authState=useAuth();
  const apiUrl= import.meta.env.VITE_API_URL;

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFeature({ ...newFeature, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

useEffect(() => {
  console.log(selectedIcon)
  console.log(amenityIds)
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
      }
      console.log(facilityResponse);
      setFeatures(facilityResponse.data[0].amenities);
      console.log(facilityResponse.data[0].amenities);
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }

  };

  fetchFacility();
}, []);


const base64ToBlob = (base64: string) => {
  const [header, base64String] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream'; // MIME türünü çıkarır
  const byteCharacters = atob(base64String);
  const byteNumbers = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteNumbers], { type: mimeType });
};

const handleAddFeature = () => {
  if (!newFeature.imageUrl || !newFeature.name) {
    setOpenSnackbar(true);
    return;
  }
  console.log("newFeature:");
  console.log(newFeature);

  const formData = new FormData();
  const fileBlob = base64ToBlob(newFeature.imageUrl);
  const mimeType = fileBlob.type; // Blob'un MIME türünü alır
  const fileExtension = mimeType.split('/')[1]; // "image/jpeg" → "jpeg"

  formData.append('image', new File([fileBlob], `court-image.${fileExtension}`, { type: mimeType }));
  formData.append('data', JSON.stringify(newFeature)); // Blob yerine düz string kullanımı

  const addFeature = async () => {
    try {
      let response = await axios.post(`${apiUrl}/api/v1/amenities`, formData, {
        headers: {
          'Authorization': `Bearer ${authState.user?.access_token}`,
          'Accept': 'application/json',
        },
      });
      console.log("added amenity:");
      console.log(response);

      setNewFeature({ imageUrl: "", name: "" });
      console.log("addedAmenityId is:");
      console.log(response.data.response);

      const featureIds = [...features.map(feature => feature.id)]; // features'dan id'leri kopyalayın
      featureIds.push(response.data.response); // yeni featureId'yi ekleyin
      console.log(featureIds);

      setAmenityIds(featureIds); // yeni featureId array'ini state'e set edin
      setSelectedIcon(null);

      // Save işlemi burada yapılacak, çünkü amenityIds state'inin güncellenmesini beklemeliyiz
      saveUpdatedFacility(featureIds);

    } catch (error) {
      console.error('Error adding feature:', error);
    }
  };

  // Add feature işlemini başlatıyoruz
  addFeature();
};

const saveUpdatedFacility = async (featureIds:string[]) => {
  const newformData = new FormData();
  console.log("featureIds:");
  console.log(featureIds);
  const updateAmenity={
    "id":facility?.id,
    amenityIds:featureIds
  }

  // amenityIds array'ini JSON formatında append ediyoruz
  newformData.append('data', new Blob([JSON.stringify(updateAmenity)], { type: 'application/json' }));

  try {
    const response = await axios.patch(`${apiUrl}/api/v1/facilities/${facility?.id}`, newformData, {
      headers: {
        'Authorization': `Bearer ${authState.user?.access_token}`,
        'Accept': 'application/json',
      },
    });
    console.log('Facility updated successfully:', response);
  } catch (error) {
    console.error('Error saving edited facility:', error);
  }
};


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Card>
      <CardHeader
        sx={{
          fontFamily: "Montserrat",
          fontSize: "1.5rem",
          fontWeight: 600,
          paddingLeft: "2rem",
        }}
        title="Tesis Özellikleri"
      />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          fontFamily: "Montserrat",
          fontSize: "1rem",
          paddingLeft: "2rem",
          color: "#333",
        }}
      >
        {features.map((feature, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "5px",
              width: "calc(33.33% - 1rem)",
            }}
          >
            <img src={feature.imageUrl} alt={feature.name} width={40} height={40} />
            <Typography sx={{ fontSize: "1rem", color: "#333" }}>
              {feature.name}
            </Typography>
          </Box>
        ))}
      </Box>
      <CardContent sx={{ paddingTop: "2rem", paddingLeft: "2rem" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <label htmlFor="icon-upload">
                <Input
                  accept="image/*"
                  id="icon-upload"
                  type="file"
                  onChange={handleIconChange}
                />
                <Button variant="contained" component="span" startIcon={<UploadFileIcon />}>
                  İkon Yükle
                </Button>
              </label>
              {newFeature.imageUrl && (
                <img src={newFeature.imageUrl} alt="Selected Icon" width={40} height={40} />
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Servis Adı"
              value={newFeature.name}
              onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleAddFeature}>
              Özellik Ekle
            </Button>
          </Grid>
        </Grid>
      </CardContent>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: "100%" }}>
          Lütfen bir ikon ve isim seçin!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CourtServices;

