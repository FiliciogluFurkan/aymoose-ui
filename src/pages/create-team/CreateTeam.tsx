import { useState } from "react";
import { Box, TextField, Button, Select, MenuItem, InputLabel, Typography, Container } from "@mui/material";
import html2canvas from "html2canvas";
import sahaImage from '@/assets/images/saha.png';
import { useTheme } from '@mui/material/styles';
import { Modal } from "@mui/material";
import fifakart from "@/assets/images/fifakart.png";

const formations = [
  "2-2-1", // 6 kişilik (5+1 kaleci)
  "2-3-1", // 7 kişilik (6+1 kaleci)
  "3-2-1", // 7 kişilik (6+1 kaleci)
  "2-1-2", // 6 kişilik (5+1 kaleci)
  "3-1-2", // 7 kişilik (6+1 kaleci)
  "2-2-2", // 6 saha oyuncusu + 1 kaleci
  "3-3-0", // 6 saha oyuncusu + 1 kaleci
  "2-1-3", // 6 saha oyuncusu + 1 kaleci
];
interface Player {
  name: string;
  number: string;
  speed: string | number;
  shoot: string | number;
  pass: string | number;
  dribbling: string | number;
  defense: string | number;
  physical: string | number;
  [key: string]: string | number; // Dinamik anahtarları kabul etmek için index signature
};


const CreateTeam = (): JSX.Element => {
  const theme = useTheme();
  const [teamName, setTeamName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#FF0000");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [formation, setFormation] = useState(formations[0]);
  const [players, setPlayers] = useState<Player[]>([]); // Doğru kullanım


  /**    { label: "Hız", key: "speed" },
                            { label: "Şut", key: "shoot" },
                            { label: "Pas", key: "pass" },
                            { label: "Dripling", key: "dribbling" },
                            { label: "Defans", key: "defense" },
                            { label: "Fizik", key: "physical" }, */

  const handleDownload = async () => {
    console.log("Current players state before download:", players);

    const element = document.getElementById("team-preview");
    if (element) {
      const canvas = await html2canvas(element);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${teamName}-team.png`;
      link.click();
    }
  };

  const getPlayerPositions = (formation: string) => {
    const [def, mid, fwd] = formation.split('-').map(Number);
    const positions = [];

    // Kaleci
    positions.push({ top: '85%', left: '50%' });

    // Defans
    for (let i = 0; i < def; i++) {
      if (def === 2) {
        positions.push({
          top: '65%',
          left: `${30 + (i * 40)}%`
        });
      } else if (def === 3) {
        positions.push({
          top: '65%',
          left: `${25 + (i * 25)}%`
        });
      }
    }

    // Orta saha
    for (let i = 0; i < mid; i++) {
      if (formation === "3-3-0") {  // 3-3-0 formasyonu için özel pozisyonlama
        positions.push({
          top: '30%',  // Daha ileriye taşındı
          left: `${25 + (i * 25)}%`
        });
      } else if (mid === 1) {
        positions.push({
          top: '45%',
          left: '50%'
        });
      } else if (mid === 2) {
        positions.push({
          top: '45%',
          left: `${30 + (i * 40)}%`
        });
      } else if (mid === 3) {
        positions.push({
          top: '45%',
          left: `${25 + (i * 25)}%`
        });
      }
    }

    // Forvet
    for (let i = 0; i < fwd; i++) {
      if (fwd === 1) {
        positions.push({
          top: '25%',
          left: '50%'
        });
      } else if (fwd === 2) {
        positions.push({
          top: '25%',
          left: `${30 + (i * 40)}%`
        });
      } else if (fwd === 3) {
        positions.push({
          top: '25%',
          left: `${25 + (i * 25)}%`
        });
      }
    }

    return positions;
  };

  const handleFormationChange = (newFormation: string) => {
    setFormation(newFormation);
    const totalPlayers = 1 + newFormation.split('-').reduce((a, b) => a + parseInt(b), 0);
    const newPlayers = Array(totalPlayers).fill(null).map(() => ({
      name: '',
      number: '',
      speed: '',
      shoot: '',
      pass: '',
      dribbling: '',
      defense: '',
      physical: ''
    }));
    setPlayers(newPlayers); // Yeni state atanıyor
  };

  const [openModal, setOpenModal] = useState(false);
  const [idx, setIdx] = useState(0);
  const [tempPlayer, setTempPlayer] = useState(players[idx] || {});

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      newPlayers[idx] = { ...tempPlayer }; // Update the player with the new info
      return newPlayers;
    });
    setOpenModal(false);
    setTempPlayer({ name: '', number: '', speed: '', shoot: '', pass: '', dribbling: '', defense: '', physical: '' });

  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setTempPlayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  return (
    <Box sx={{
      position: 'relative',
      top: theme.spacing(15),
      mb: theme.spacing(25),
      width: '100vw'
    }}>
      <Container
        maxWidth={false}
        sx={{
          py: 3,
          width: '100%',
          '& .MuiContainer-root': {
            maxWidth: 'none'
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          gap: 3,
          width: '100%',
          justifyContent: 'center'
        }}>
          {/* Sol taraf - Takım Renkleri */}
          <Box sx={{
            width: theme.spacing(39), // Genişlik ayarı (31.25 -> 39)  
            backgroundColor: '#1e1e1e', // Koyu arka plan  
            borderRadius: 2, // Yuvarlatılmış köşeler  
            boxShadow: 2, // Gölgelendirme derinlik  
            padding: 2, // İç padding  
          }}>
            <Typography variant="h6" sx={{
              mb: 2,
              color: '#a5d6a7', // Açık yeşil başlık  
              textAlign: 'center', // Ortalanmış başlık  
            }}>
              Takım Renkleri
            </Typography>

            <Box sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#fff' }}>Ana Renk</InputLabel>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  marginTop: '8px',
                  border: 'none', // Kenar kaldırıldı  
                  padding: 0,
                  borderRadius: '5px', // Yuvarlatılmış kenarlar  
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Gölgelendirme  
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#fff' }}>İkincil Renk</InputLabel>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  marginTop: '8px',
                  border: 'none', // Kenar kaldırıldı  
                  padding: 0,
                  borderRadius: '5px', // Yuvarlatılmış kenarlar  
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Gölgelendirme  
                }}
              />
            </Box>
          </Box>
            
          {/* Orta - Saha */}
          <Box sx={{
            width: theme.spacing(110), //75 di 90 yaptım neden bilmiorum
            flex: 'none'
          }}>
            <Box id="team-preview">
              <Box
                sx={{
                  height: theme.spacing(170), //87.5 di 150 yaptım
                  position: 'relative',
                  border: '2px solid white',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundImage: `url(${sahaImage})`,
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              >
                {getPlayerPositions(formation).map((pos, idx) => (

                  <Box
                    key={idx}
                    sx={{
                      position: 'absolute',
                      top: pos.top,
                      left: pos.left,
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      width: theme.spacing(10),
                      zIndex: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 150, // Daha küçük genişlik
                        borderRadius: "8px",
                     
                        
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                        textAlign: "center",
                        fontFamily: "Arial, sans-serif",
                        overflow: "hidden",
                      }}
                    >
                      {/* Üst Başlık Kısmı */}
                      {/*    <Box
                        sx={{
                          background: "linear-gradient(to bottom, #ffd700, #fff)",
                          padding: 2, // Minimum padding
                        }}
                      >

                      </Box> */}

                      {/* İçerik Kısmı */}
                      <Box
                        sx={{
                          padding: 0.5,
                          backgroundImage: `url(${fifakart})`, // Correct way to use the image URL
                          backgroundSize: 'cover', // Ensure the image covers the entire container
                          backgroundPosition: 'center', // Center the image
                          color: '#ffffff', // Set text color to white for better visibility
                          height: '275px',
                        }}
                      >
                        <Button
                          onClick={() => {
                            handleOpenModal();
                            setIdx(idx);
                          }}
                          sx={{
                            backgroundColor: 'transparent',
                            color: '#a5d6a7',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            transition: 'color 0.3s, transform 0.2s',
                            '&:hover': {
                              color: '#81c784',
                              transform: 'scale(1.1)',
                            },
                            '&:focus': {
                              outline: 'none',
                            },
                          }}
                        >
                          +
                        </Button>

                        <Modal sx={{ marginTop: '8rem' }} open={openModal} onClose={handleCloseModal}>
                          <Box
                            sx={{
                              width: 400,
                              padding: 3,
                              backgroundColor: '#1e1e1e',
                              margin: 'auto',
                              borderRadius: 2,
                              boxShadow: 12,
                            }}
                          >
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: '#a5d6a7' }}>
                              Oyuncu Bilgileri
                            </Typography>

                            <TextField
                              size="small"
                              value={tempPlayer.name || ''}
                              name="name"
                              onChange={handleChange}
                              fullWidth
                              variant="outlined"
                              placeholder="İsim girin"
                              sx={{
                                marginBottom: 2,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 10,
                                  borderColor: '#a5d6a7',
                                  backgroundColor: '#323232',
                                },
                                '& .MuiInputBase-input': {
                                  color: '#ffffff',
                                },
                              }}
                            />

                            {/* Özellikler kısmı */}
                            {[
                              { label: 'Hız', key: 'speed' },
                              { label: 'Şut', key: 'shoot' },
                              { label: 'Pas', key: 'pass' },
                              { label: 'Dripling', key: 'dribbling' },
                              { label: 'Defans', key: 'defense' },
                              { label: 'Fizik', key: 'physical' },
                            ].map((stat, statIndex) => (
                              <TextField
                                key={statIndex}
                                size="small"
                                value={tempPlayer[stat.key] || ''}
                                name={stat.key}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                                placeholder={`${stat.label} değeri girin`}
                                sx={{
                                  marginBottom: 1,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 10,
                                    borderColor: '#a5d6a7',
                                    backgroundColor: '#323232',
                                  },
                                  '& .MuiInputBase-input': {
                                    color: '#ffffff',
                                  },
                                }}
                              />
                            ))}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                              <Button
                                variant="outlined"
                                onClick={handleCloseModal}
                                sx={{
                                  borderRadius: 10,
                                  width: '48%',
                                  borderColor: '#a5d6a7',
                                  color: '#a5d6a7',
                                  '&:hover': {
                                    backgroundColor: '#a5d6a7',
                                    color: '#121212',
                                  },
                                }}
                              >
                                Kapat
                              </Button>
                              <Button
                                variant="contained"
                                onClick={handleCloseModal}
                                sx={{
                                  borderRadius: 10,
                                  width: '48%',
                                  backgroundColor: '#a5d6a7',
                                  '&:hover': {
                                    backgroundColor: '#81c784',
                                  },
                                }}
                              >
                                Kaydet
                              </Button>
                            </Box>
                          </Box>
                        </Modal>

                        {/* Oyuncu ismi ve özelliklerini kartta göster */}
                        <Typography
                          variant="h6"
                          sx={{
                            bgcolor: 'transparent',
                            color: '#ffffff', // Ensure text is visible over the image
                            fontWeight: 700,
                            textAlign: 'center',
                            marginBottom: 1,
                          }}
                        >
                          {players[idx]?.name || '-'}
                        </Typography>

                        <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {[
                            { label: 'Hız', key: 'speed' },
                            { label: 'Şut', key: 'shoot' },
                            { label: 'Pas', key: 'pass' },
                            { label: 'Dripling', key: 'dribbling' },
                            { label: 'Defans', key: 'defense' },
                            { label: 'Fizik', key: 'physical' },
                          ]
                            .reduce<{ label: string; key: string }[][]>((acc, _, i, arr) => {
                              if (i % 2 === 0) {
                                acc.push(arr.slice(i, i + 2));
                              }
                              return acc;
                            }, [])
                            .map((pair, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '8px 0',
                                  borderBottom: '1px solid #eee',
                                }}
                              >
                                {pair.map((stat, statIndex) => (
                                  <Box
                                    key={statIndex}
                                    sx={{
                                      flex: 1,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      padding: '0 8px',
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ fontSize: '10px' }}>
                                      {stat.label}:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 700 }}>
                                      {players[idx]?.[stat.key] || '-'}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            ))}
                        </Box>
                      </Box>

                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center', // Yatayda ortalama  
                alignItems: 'center', // Dikeyde ortalama  

                padding: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleDownload}
                sx={{
                  backgroundColor: '#000', // Siyah arka plan  
                  color: '#4caf50', // Yeşil yazı  
                  borderRadius: '20px', // Yumuşak kenarlar  
                  padding: '10px 80px', // Yapılandırılmış padding  
                  fontWeight: 'bold', // Kalın yazı  
                  transition: 'background-color 0.3s, transform 0.2s', // Geçiş efekti  
                  '&:hover': {
                    backgroundColor: '#333', // Hover durumu için gri ton  
                    transform: 'scale(1.05)', // Hover etkisi  
                  },
                }}
              >
                Takımı İndir
              </Button>
            </Box>
          </Box>

          {/* Sağ taraf - Takım Bilgileri */}
          <Box sx={{
            width: theme.spacing(39), // Genişletilmiş genişlik  
            backgroundColor: '#1e1e1e', // Koyu arka plan  
            borderRadius: 2, // Yuvarlatılmış köşeler  
            boxShadow: 2, // Gölgelendirme  
            padding: 3, // İç padding  
          }}>
            <Typography variant="h6" sx={{
              mb: 2,
              color: '#a5d6a7', // Açık yeşil başlık  
              textAlign: 'center', // Ortalanmış başlık  
            }}>
              Takım Bilgileri
            </Typography>

            <TextField
              label="Takım Adı"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
              variant="outlined" // Dış çizgili stil  
              InputLabelProps={{
                sx: {
                  color: 'rgba(255, 255, 255, 0.7)', // Açık beyaz rengi  
                },
              }}
              placeholder="Takım adını girin"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderColor: 'rgba(255, 255, 255, 0.5)', // Kenar rengi  
                  '&:hover fieldset': {
                    borderColor: '#4caf50', // Hover durumunda yeşil kenar  
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50', // Odaklandığında yeşil kenar  
                  },
                },
                color: '#fff', // Yazı rengi  
              }}
            />

            <Select
              value={formation}
              onChange={(e) => handleFormationChange(e.target.value)}
              fullWidth
              displayEmpty
              inputProps={{ 'aria-label': 'Select Formation' }} // Erişim için alt etiket  
              sx={{
                mb: 2,
                backgroundColor: '#333', // Koyu arka plan  
                color: '#fff', // Yazı rengi  
                '& .MuiSelect-icon': {
                  color: '#4caf50', // Aşağı ok rengi  
                },
                '&:focus': {
                  borderColor: '#4caf50', // Odak rengi  
                },
                '& .MuiSelect-select': {
                  padding: '10px 24px', // İç padding  
                },
              }}
            >
              <MenuItem value="" disabled>Select a formation</MenuItem> {/* Varsayılan menü öğesi */}
              {formations.map((f) => (
                <MenuItem key={f} value={f} sx={{ color: '#000', backgroundColor: '#fff', '&:hover': { backgroundColor: '#4caf50', color: '#fff' } }}>
                  {f}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateTeam;
