import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Container,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import html2canvas from "html2canvas";
import sahaImage from "@/assets/images/saha.png";
import cimSahaImage from "@/assets/images/çimsaha.jpg";
import fifakart from "@/assets/images/fifakart.png";
import { useTheme } from "@mui/material/styles";

const formations = [
  "2-2-1",
  "2-3-1",
  "3-2-1",
  "2-1-2",
  "3-1-2",
  "2-2-2",
  "3-3-0",
  "2-1-3",
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
  [key: string]: string | number;
}

const CreateTeam = (): JSX.Element => {
  const theme = useTheme();

  const [plan, setPlan] = useState<"basic" | "pro">("basic");

  const [teamName, setTeamName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#FF0000");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [formation, setFormation] = useState(formations[0]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);
  const [tempPlayer, setTempPlayer] = useState<Partial<Player>>({});

  const isBasic = plan === "basic";

  const panelSx = {
    p: 2.5,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
  };

  const handleDownload = async () => {
    const element = document.getElementById("team-preview");
    if (element) {
      const canvas = await html2canvas(element);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${teamName || "team"}-team.png`;
      link.click();
    }
  };

  const getPlayerPositions = (formation: string) => {
    const [def, mid, fwd] = formation.split("-").map(Number);
    const positions: { top: string; left: string }[] = [];

    positions.push({ top: "85%", left: "50%" });

    for (let i = 0; i < def; i++) {
      positions.push({
        top: "65%",
        left: def === 2 ? `${30 + i * 40}%` : `${25 + i * 25}%`,
      });
    }

    for (let i = 0; i < mid; i++) {
      if (formation === "3-3-0") {
        positions.push({ top: "30%", left: `${25 + i * 25}%` });
      } else if (mid === 1) {
        positions.push({ top: "45%", left: "50%" });
      } else if (mid === 2) {
        positions.push({ top: "45%", left: `${30 + i * 40}%` });
      } else {
        positions.push({ top: "45%", left: `${25 + i * 25}%` });
      }
    }

    for (let i = 0; i < fwd; i++) {
      if (fwd === 1) {
        positions.push({ top: "25%", left: "50%" });
      } else if (fwd === 2) {
        positions.push({ top: "25%", left: `${30 + i * 40}%` });
      } else {
        positions.push({ top: "25%", left: `${25 + i * 25}%` });
      }
    }

    return positions;
  };

  const handleFormationChange = (newFormation: string) => {
    setFormation(newFormation);

    const totalPlayers =
      1 + newFormation.split("-").reduce((a, b) => a + parseInt(b), 0);

    const newPlayers = Array(totalPlayers)
      .fill(null)
      .map(() => ({
        name: "",
        number: "",
        speed: "",
        shoot: "",
        pass: "",
        dribbling: "",
        defense: "",
        physical: "",
      }));

    setPlayers(newPlayers);
  };

  const handleOpenModal = (idx: number) => {
    setModalIdx(idx);
    setTempPlayer(players[idx] || {});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setPlayers((prev) => {
      const next = [...prev];
      next[modalIdx] = { ...next[modalIdx], ...tempPlayer } as Player;
      return next;
    });

    setOpenModal(false);
    setTempPlayer({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempPlayer((prev) => ({ ...prev, [name]: value }));
  };

  const statFields = [
    { label: "Hız", key: "speed" },
    { label: "Şut", key: "shoot" },
    { label: "Pas", key: "pass" },
    { label: "Dripling", key: "dribbling" },
    { label: "Defans", key: "defense" },
    { label: "Fizik", key: "physical" },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        top: theme.spacing(10),
        mb: theme.spacing(16),
        width: "100%",
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2f7 45%, #f8fafc 100%)",
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <ToggleButtonGroup
          value={plan}
          exclusive
          onChange={(_, val) => val && setPlan(val)}
          sx={{
            backgroundColor: isBasic ? "#ffffff" : "#1e1e1e",
            borderRadius: 999,
            padding: "5px",
            boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          <ToggleButton
            value="basic"
            sx={{
              borderRadius: "999px !important",
              px: 4,
              fontWeight: 700,
              border: "none",
              textTransform: "none",
              color: isBasic ? "#fff" : "#64748b",
              backgroundColor: isBasic ? "#2563eb !important" : "transparent",
              "&.Mui-selected": {
                backgroundColor: "#2563eb",
                color: "#fff",
              },
            }}
          >
            Basic
          </ToggleButton>

          <ToggleButton
            value="pro"
            sx={{
              borderRadius: "999px !important",
              px: 4,
              fontWeight: 700,
              border: "none",
              textTransform: "none",
              color: !isBasic ? "#fff" : "#64748b",
              backgroundColor: !isBasic ? "#4caf50 !important" : "transparent",
              "&.Mui-selected": {
                backgroundColor: "#4caf50",
                color: "#fff",
              },
            }}
          >
            Pro
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Container maxWidth={false} sx={{ py: 1, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, md: 2.5 },
            width: "100%",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {isBasic ? (
            <Box sx={{ width: theme.spacing(31.25) }}>
              <Box sx={panelSx}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 800, color: "#0f172a" }}
                >
                  Takım Renkleri
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: "#475569", mb: 1 }}>
                    Ana Renk
                  </InputLabel>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: "transparent",
                    }}
                  />
                </Box>

                <Box>
                  <InputLabel sx={{ color: "#475569", mb: 1 }}>
                    İkincil Renk
                  </InputLabel>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: "transparent",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                width: theme.spacing(39),
                backgroundColor: "#1e1e1e",
                borderRadius: 3,
                boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
                padding: 2.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#a5d6a7", textAlign: "center" }}
              >
                Takım Renkleri
              </Typography>

              <Box sx={{ mb: 3 }}>
                <InputLabel sx={{ color: "#fff" }}>Ana Renk</InputLabel>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    marginTop: "8px",
                    border: "none",
                    padding: 0,
                    borderRadius: "8px",
                    outline: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                />
              </Box>

              <Box>
                <InputLabel sx={{ color: "#fff" }}>İkincil Renk</InputLabel>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    marginTop: "8px",
                    border: "none",
                    padding: 0,
                    borderRadius: "8px",
                    outline: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                />
              </Box>
            </Box>
          )}

          <Box
            sx={{
              width: isBasic ? theme.spacing(68) : theme.spacing(110),
              flex: "none",
            }}
          >
            <Box
              id="team-preview"
              sx={{
                p: isBasic ? 1.5 : 0,
                borderRadius: 4,
                backgroundColor: isBasic ? "#ffffff" : "transparent",
                boxShadow: isBasic
                  ? "0 18px 48px rgba(15,23,42,0.10)"
                  : "none",
              }}
            >
              <Box
                sx={{
                  height: isBasic ? theme.spacing(82) : theme.spacing(170),
                  position: "relative",
                  border: isBasic
                    ? "1px solid rgba(255,255,255,0.8)"
                    : "2px solid white",
                  borderRadius: 3,
                  overflow: "hidden",
                  backgroundImage: `url(${isBasic ? sahaImage : cimSahaImage})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              >
                {getPlayerPositions(formation).map((pos, idx) =>
                  isBasic ? (
                    <Box
                      key={idx}
                      sx={{
                        position: "absolute",
                        top: pos.top,
                        left: pos.left,
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        width: theme.spacing(10),
                        zIndex: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: theme.spacing(3.75),
                          height: theme.spacing(3.75),
                          borderRadius: "50%",
                          bgcolor: primaryColor,
                          border: `2px solid ${secondaryColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: theme.typography.pxToRem(12),
                          fontWeight: 800,
                          mb: 1,
                          boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                        }}
                      >
                        {idx + 1}
                      </Box>

                      <TextField
                        size="small"
                        placeholder="İsim"
                        value={players[idx]?.name || ""}
                        onChange={(e) => {
                          const next = [...players];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setPlayers(next);
                        }}
                        sx={{
                          "& .MuiInputBase-root": {
                            bgcolor: "rgba(255,255,255,0.72)",
                            color: secondaryColor,
                            fontWeight: 700,
                            borderRadius: 2,
                            backdropFilter: "blur(8px)",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.65)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.9)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "white",
                            },
                          },
                          "& .MuiInputBase-input": {
                            py: 0.5,
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            "&::placeholder": {
                              color: `${secondaryColor}90`,
                              opacity: 1,
                              textAlign: "center",
                              fontWeight: 500,
                            },
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      key={idx}
                      sx={{
                        position: "absolute",
                        top: pos.top,
                        left: pos.left,
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        width: theme.spacing(10),
                        zIndex: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 150,
                          borderRadius: "8px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          textAlign: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            padding: 0.5,
                            backgroundImage: `url(${fifakart})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            color: "#ffffff",
                            height: "275px",
                          }}
                        >
                          <Button
                            onClick={() => handleOpenModal(idx)}
                            sx={{
                              backgroundColor: "transparent",
                              color: "#a5d6a7",
                              fontSize: "20px",
                              fontWeight: "bold",
                              transition: "color 0.3s, transform 0.2s",
                              "&:hover": {
                                color: "#81c784",
                                transform: "scale(1.1)",
                              },
                              "&:focus": { outline: "none" },
                            }}
                          >
                            +
                          </Button>

                          <Typography
                            variant="h6"
                            sx={{
                              bgcolor: "transparent",
                              color: "#ffffff",
                              fontWeight: 700,
                              textAlign: "center",
                              marginBottom: 1,
                            }}
                          >
                            {players[idx]?.name || "-"}
                          </Typography>

                          <Box
                            component="ul"
                            sx={{ listStyle: "none", padding: 0, margin: 0 }}
                          >
                            {statFields
                              .reduce<{ label: string; key: string }[][]>(
                                (acc, _, i, arr) => {
                                  if (i % 2 === 0) acc.push(arr.slice(i, i + 2));
                                  return acc;
                                },
                                []
                              )
                              .map((pair, pairIdx) => (
                                <Box
                                  key={pairIdx}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 0",
                                    borderBottom: "1px solid #eee",
                                  }}
                                >
                                  {pair.map((stat, si) => (
                                    <Box
                                      key={si}
                                      sx={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        padding: "0 8px",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{ fontSize: "10px" }}
                                      >
                                        {stat.label}
                                      </Typography>

                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: "12px",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {players[idx]?.[stat.key] || "-"}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )
                )}
              </Box>
            </Box>

            {isBasic ? (
              <Button
                variant="contained"
                onClick={handleDownload}
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 800,
                  backgroundColor: "#2563eb",
                  boxShadow: "0 12px 28px rgba(37,99,235,0.24)",
                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                }}
              >
                Takımı İndir
              </Button>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleDownload}
                  sx={{
                    backgroundColor: "#000",
                    color: "#4caf50",
                    borderRadius: "20px",
                    padding: "10px 80px",
                    fontWeight: "bold",
                    transition: "background-color 0.3s, transform 0.2s",
                    "&:hover": {
                      backgroundColor: "#333",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  Takımı İndir
                </Button>
              </Box>
            )}
          </Box>

          {isBasic ? (
            <Box sx={{ width: theme.spacing(31.25) }}>
              <Box sx={panelSx}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 800, color: "#0f172a" }}
                >
                  Takım Bilgileri
                </Typography>

                <TextField
                  label="Takım Adı"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  fullWidth
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                    },
                  }}
                />

                <Select
                  value={formation}
                  onChange={(e) => handleFormationChange(e.target.value)}
                  fullWidth
                  label="Formasyon"
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    backgroundColor: "#f8fafc",
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 200,
                        borderRadius: 3,
                        "& .MuiMenuItem-root": { padding: "8px 16px" },
                      },
                    },
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                  }}
                >
                  {formations.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                width: theme.spacing(39),
                backgroundColor: "#1e1e1e",
                borderRadius: 3,
                boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
                padding: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#a5d6a7", textAlign: "center" }}
              >
                Takım Bilgileri
              </Typography>

              <TextField
                label="Takım Adı"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                placeholder="Takım adını girin"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": { borderColor: "#4caf50" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                  },
                  "& .MuiInputBase-input": { color: "#fff" },
                }}
              />

              <Select
                value={formation}
                onChange={(e) => handleFormationChange(e.target.value)}
                fullWidth
                displayEmpty
                sx={{
                  mb: 2,
                  backgroundColor: "#333",
                  color: "#fff",
                  "& .MuiSelect-icon": { color: "#4caf50" },
                  "& .MuiSelect-select": { padding: "10px 24px" },
                }}
              >
                <MenuItem value="" disabled>
                  Select a formation
                </MenuItem>

                {formations.map((f) => (
                  <MenuItem
                    key={f}
                    value={f}
                    sx={{
                      color: "#000",
                      backgroundColor: "#fff",
                      "&:hover": { backgroundColor: "#4caf50", color: "#fff" },
                    }}
                  >
                    {f}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        </Box>
      </Container>

      <Modal sx={{ marginTop: "8rem" }} open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            width: 400,
            padding: 3,
            backgroundColor: "#1e1e1e",
            margin: "auto",
            borderRadius: 2,
            boxShadow: 12,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ textAlign: "center", color: "#a5d6a7" }}
          >
            Oyuncu Bilgileri
          </Typography>

          <TextField
            size="small"
            value={tempPlayer.name || ""}
            name="name"
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder="İsim girin"
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 10,
                borderColor: "#a5d6a7",
                backgroundColor: "#323232",
              },
              "& .MuiInputBase-input": { color: "#ffffff" },
            }}
          />

          {statFields.map((stat, i) => (
            <TextField
              key={i}
              size="small"
              value={(tempPlayer[stat.key as keyof Player] as string) || ""}
              name={stat.key}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder={`${stat.label} değeri girin`}
              sx={{
                marginBottom: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 10,
                  borderColor: "#a5d6a7",
                  backgroundColor: "#323232",
                },
                "& .MuiInputBase-input": { color: "#ffffff" },
              }}
            />
          ))}

          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: 10,
                width: "48%",
                borderColor: "#a5d6a7",
                color: "#a5d6a7",
                "&:hover": { backgroundColor: "#a5d6a7", color: "#121212" },
              }}
            >
              Kapat
            </Button>

            <Button
              variant="contained"
              onClick={handleCloseModal}
              sx={{
                borderRadius: 10,
                width: "48%",
                backgroundColor: "#a5d6a7",
                "&:hover": { backgroundColor: "#81c784" },
              }}
            >
              Kaydet
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CreateTeam;