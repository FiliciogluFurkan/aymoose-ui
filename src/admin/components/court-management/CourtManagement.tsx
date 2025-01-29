import { Box, Button, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import axios from 'axios';
import { Court } from '@/interfaces/Court';
import { useAuth } from 'react-oidc-context';
import { getIdFromToken } from '@/services/DecodedJwt';


const CourtManagement = (): JSX.Element => {

    const [courts, setCourts] = useState<Court[]>([]);
    const authState = useAuth();
    const [editingFields, setEditingFields] = useState<{ [key: number]: boolean }>({});
    const apiUrl = import.meta.env.VITE_API_URL;

    const [facilityResponse, setFacilityResponse] = useState<any>(null);
    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const facilityResponse = await axios.get(
                    `${apiUrl}/api/v1/facilities?userId=${
                      getIdFromToken(authState.user?.access_token).sub
                    }`,
                    {}
                  );
                console.log(facilityResponse.data);
                console.log("facility printed");
                setFacilityResponse(facilityResponse);
            } catch (err) {
                console.error('Error fetching facilities:', err);
            }
        };

        fetchFacility();
    }, []); // Bu sadece API çağrısını yapar

    useEffect(() => {
        if (facilityResponse?.data?.length > 0) {
            setCourts(facilityResponse.data[0].courts || []);
        }
    }, [facilityResponse]); // facilityResponse değiştiğinde çalışır

    const handleEdit = (courtId: number) => {
        console.log(courtId);
        setEditingFields((prev) => ({ ...prev, [courtId]: true }));
    };


    const SaveEditedCourt = async (index: number) => {
        const updateCourt = courts.find((_, i) => i === index);

        // Eğer updateCourt null veya undefined ise, işlem yapılmasın
        if (!updateCourt) {
            console.error("Court not found!");
            return;
        }

        console.log(updateCourt);
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(updateCourt)], { type: 'application/json' }));

        try {
            // Backend URL
            const baseURL = "https://server.sahancepte.com/api/v1/courts";

            console.log("Güncelleme yapılıyor:");

            // API isteği
            const response = await axios.patch(
                `${baseURL}/${updateCourt.id}`, // URL'deki id değerini doğru kullanıyoruz
                formData, // JSON verisi doğrudan gönderiliyor
                {
                    headers: {
                        'Authorization': `Bearer ${authState.user?.access_token}`,
                        'Accept': 'application/json',
                        //'Content-Type': 'application/json', // JSON gönderiyoruz, bu başlık gerekli
                    },
                }
            );
            // Başarılı yanıt
            console.log("Güncelleme başarılı:", response.data);
            setEditingFields((prev) => ({ ...prev, [index]: false }));

        } catch (error) {
            console.error("Güncelleme sırasında hata oluştu:", error);
        }
        
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldKey: keyof Court, index: number) => {
        const updateCourt = courts.map((f, i) =>
            i === index ? { ...f, [fieldKey]: e.target.value } : f
        );
        console.log(index);
        setCourts(updateCourt);
    };


    const toggleStatus = (index: number) => {
        const newCourts = courts.map((f, i) =>
            i === index ? { ...f, field: { ...f, status: !f.isActive } } : f
        );
        setCourts(newCourts);
    };


    const [open, setOpen] = useState(false);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [newCourt, setNewCourt] = useState({
        id: 0,
        name: '',
        image: '',
        capacity: 0,
        width: 0,
        height: 0,
        price: 0,
        status: true,
    });

    // Modal açma/kapatma fonksiyonları
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

 
    const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg') => {
        const base64String = base64.split(',')[1];
        const byteCharacters = atob(base64String);
        const byteNumbers = new Uint8Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        return new Blob([byteNumbers], { type: mimeType });
    };

    const handleAddCourt = async () => {
        if (!selectedImage) {
            alert('Lütfen bir resim seçin!');
            return;
        }

        try {
            if (!authState.user?.access_token) {
                console.error('Kullanıcı oturum açmamış veya token bulunamadı!');
                return;
            }

            const parsedToken = getIdFromToken(authState.user?.access_token);
            const fileBlob = base64ToBlob(selectedImage, 'image/jpeg');

            const formData = new FormData();
            const courtData = {
                userId: String(parsedToken.sub),
                facilityId: String(facilityResponse.data[0].id),
                name: String(newCourt.name),
                description: String('Bu halısaha 7+7 kişiliktir ve çimleri daha yeni yenilenmiştir'),
                height: Number(newCourt.height),
                width: Number(newCourt.width),
                capacity: Number(newCourt.capacity),
                price: Number(newCourt.price),
            };

            formData.append('files', new File([fileBlob], 'court-image.jpg', { type: 'image/jpeg' }));
            formData.append('data', new Blob([JSON.stringify(courtData)], { type: 'application/json' }));


            console.log('FormData:', formData);

            const response = await axios.post(`${apiUrl}/api/v1/courts`, formData, {
                headers: {
                    'Authorization': `Bearer ${authState.user?.access_token}`,
                    'Accept': 'application/json',
                   
                },
            });

            console.log('Saha başarıyla eklendi:', response.data);
            console.log('Response:', response);
            setCourts([...courts, response.data]);
            handleClose();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleChange2 = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldKey: keyof typeof newCourt) => {
        setNewCourt({ ...newCourt, [fieldKey]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // İlk dosyayı al
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === "string") {
                    setSelectedImage(event.target.result); // Base64 formatını kaydet
                }
            };
            reader.readAsDataURL(file); // Dosyayı Base64'e dönüştür
        }
    };

    return (
        <Box
            sx={{
                width: '75vw',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                margin: 'auto',
                padding: '20px',
                backgroundColor: '#f0f0f0',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    justifyContent: 'flex-start',
                }}
            >
                {courts.map((court, index) => (
                    <Box
                        key={court.id}
                        sx={{
                            width: '30%',
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Box
                            sx={{
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #ddd',
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: '1.2rem',
                                    fontWeight: 500,
                                    fontFamily: 'Roboto, sans-serif',
                                }}
                            >
                                {court.name}
                            </Box>
                            {editingFields[index] ? (

                                <Box
                                    onClick={() => toggleStatus(index)}
                                    sx={{
                                        padding: '0.3rem 0.8rem',
                                        backgroundColor: !court.isActive ? '#8bc34a' : '#e57373',
                                        color: '#fff',
                                        borderRadius: '15px',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: '#e57373',
                                        },
                                    }}
                                >
                                    {!court.isActive ? 'Aktif' : 'Pasif'}
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        padding: '0.3rem 0.8rem',
                                        backgroundColor: !court.isActive ? '#8bc34a' : '#e57373',
                                        color: '#fff',
                                        borderRadius: '15px',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                    }}    
                                >
                                    {!court.isActive ? 'Aktif' : 'Pasif'}
                                </Box>
                            )}

                        </Box>

                        <Box sx={{ padding: '1rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <Box sx={{ color: 'green' }}>
                                    <span className="material-symbols-outlined">group</span>
                                </Box>
                                <Box sx={{ paddingLeft: '1rem' }}>
                                    {editingFields[index] ? (

                                        <TextField
                                            type="number"
                                            variant="outlined"
                                            size="small"
                                            value={court.capacity}
                                            onChange={(e) => handleChange(e, 'capacity', index)}
                                            sx={{ width: '100px' }}
                                        />
                                    ) : (
                                        `Kişi sayısı: ${court.capacity}`
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <Box sx={{ color: 'green' }}>
                                    <span className="material-symbols-outlined">crop_free</span>
                                </Box>
                                <Box sx={{ paddingLeft: '1rem' }}>
                                    {editingFields[index] ? (
                                        <Box sx={{ display: 'flex', gap: '1rem' }}>
                                            <TextField
                                                type="number"
                                                value={court.width}
                                                onChange={(e) =>
                                                    handleChange(e, 'width', index)
                                                }
                                                size="small"
                                                sx={{ width: '70px' }}
                                            />
                                            <TextField
                                                type="number"
                                                value={court.height}
                                                onChange={(e) =>
                                                    handleChange(e, 'height', index)
                                                }
                                                size="small"
                                                sx={{ width: '70px' }}
                                            />
                                        </Box>
                                    ) : (
                                        `Saha Boyutu: ${court.width} x ${court.height}`
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <Box sx={{ color: 'green' }}>
                                    <span className="material-symbols-outlined">currency_lira</span>
                                </Box>
                                <Box sx={{ paddingLeft: '1rem' }}>
                                    {editingFields[index] ? (
                                        <TextField
                                            type="number"
                                            value={court.price}
                                            onChange={(e) =>
                                                handleChange(e, 'price', index)
                                            }
                                            size="small"
                                            sx={{ width: '100px' }}
                                        />
                                    ) : (
                                        `Saatlik: ${court.price} TL`
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                textAlign: 'center',
                                padding: '0.5rem',
                                backgroundColor: '#f5f5f5',
                                borderTop: '1px solid #ddd',
                            }}
                        >
                            {editingFields[index] ? (
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'green',
                                        color: 'green',
                                        width: '150px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            borderColor: '#388e3c',
                                            backgroundColor: '#388e3c',
                                            color: 'white',
                                        },
                                    }}
                                    onClick={() => SaveEditedCourt(index)}
                                >
                                    Kaydet
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    sx={{
                                        width: '150px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        borderColor: 'green',
                                        color: 'green',
                                        '&:hover': {
                                            borderColor: '#388e3c',
                                            backgroundColor: '#388e3c',
                                            color: 'white',
                                        },
                                    }}
                                    onClick={() => handleEdit(index)}
                                >
                                    Düzenle
                                </Button>
                            )}
                        </Box>
                    </Box>
                ))}

                <Box sx={{ textAlign: 'center', padding: '2rem' }}>
                    {/* "Saha Ekle" kutusu */}
                    <Box
                        sx={{
                            width: '300px',
                            height: '150px',
                            margin: '0 auto',
                            backgroundColor: '#f5f5f5',
                            border: '2px dashed #ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#e0e0e0',
                            },
                        }}
                        onClick={handleOpen}
                    >
                        {/* Seçilen görüntü varsa göster */}
                        {/* {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt="Seçilen Görsel"
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginBottom: '0.5rem',
                                }}
                            />
                        ) : (
                            <>
                                <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#777' }}>+</Box>
                                <Box sx={{ fontSize: '1.2rem', color: '#777' }}>Saha Ekle</Box>
                            </>
                        )} */}
                        <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#777' }}>+</Box>
                        <Box sx={{ fontSize: '1.2rem', color: '#777' }}>Saha Ekle</Box>
                    </Box>

                    {/* Modal */}
                    <Modal open={open} onClose={handleClose}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '400px',
                                backgroundColor: 'white',
                                border: '2px solid #ccc',
                                borderRadius: '10px',
                                boxShadow: 24,
                                p: 4,
                            }}
                        >
                            <h2>Saha Bilgilerini Girin</h2>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <TextField
                                    label="Saha Adı"
                                    value={newCourt.name}
                                    onChange={(e) => handleChange2(e, 'name')}
                                    fullWidth
                                />
                                <TextField
                                    label="Kişi Sayısı"
                                    type="number"
                                    value={newCourt.capacity}
                                    onChange={(e) => handleChange2(e, 'capacity')}
                                    fullWidth
                                />
                                <TextField
                                    label="Genişlik (m)"
                                    type="number"
                                    value={newCourt.width}
                                    onChange={(e) => handleChange2(e, 'width')}
                                    fullWidth
                                />
                                <TextField
                                    label="Yükseklik (m)"
                                    type="number"
                                    value={newCourt.height}
                                    onChange={(e) => handleChange2(e, 'height')}
                                    fullWidth
                                />
                                <TextField
                                    label="Saatlik Ücret (₺)"
                                    type="number"
                                    value={newCourt.price}
                                    onChange={(e) => handleChange2(e, 'price')}
                                    fullWidth
                                />
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{ marginTop: '1rem' }}
                                >
                                    Görsel Seç
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                    />

                                </Button>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '1.5rem',
                                }}
                            >
                                <Button variant="outlined" color="error" onClick={handleClose}>
                                    İptal
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleAddCourt}>
                                    Kaydet
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </Box>

            </Box>
        </Box>
    );
}

export default CourtManagement;
