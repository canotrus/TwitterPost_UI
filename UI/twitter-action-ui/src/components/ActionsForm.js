import React, { useState, useEffect } from "react";
import { 
  TextField, 
  Checkbox, 
  Button, 
  Stack, 
  FormControlLabel, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Backdrop,
  Typography
} from "@mui/material";

const ActionsForm = () => {
  // Twitter işlemleri için state'ler
  const [tweetUrl, setTweetUrl] = useState("");
  const [like, setLike] = useState(false);
  const [retweet, setRetweet] = useState(false);
  const [comment, setComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [results, setResults] = useState(null);

  // Hesap yönetimi için state'ler
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    password: '',
    description: ''
  });
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hesapları yükle
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'listAccount'
        })
      });

      if (!response.ok) {
        throw new Error('Hesaplar getirilirken bir hata oluştu');
      }

      const data = await response.json();
      const formattedData = Array.isArray(data) ? data : [data];
      setAccounts(formattedData);
    } catch (error) {
      console.error('Hesaplar yüklenirken hata:', error);
      setAccounts([]);
    }
  };

  // Twitter işlemleri için submit
  const handleSubmit = async () => {
    setIsLoading(true); // İşlem başladığında loading'i aktif et
    
    const selectedAccounts = accounts.filter(account => selected.includes(account.name));
    const payload = selectedAccounts.map(account => ({
      accountName: account.name,
      password: account.password,
      tweet_url: tweetUrl,
      like,
      retweet,
      comment,
      comment_text: commentText
    }));

    try {
      setResults(null);
      const response = await fetch('http://localhost:5000/twitterAction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResults(data.results);
      setSelected([]);
      alert('İşlem başarıyla tamamlandı!');
      
    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      alert('İşlem sırasında bir hata oluştu');
    } finally {
      setIsLoading(false); // İşlem bittiğinde loading'i kapat
    }
  };

  // Hesap yönetimi fonksiyonları
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(accounts.map(account => account.name));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, name];
    } else {
      newSelected = selected.filter((item) => item !== name);
    }

    setSelected(newSelected);
  };

  const handleAddAccount = async () => {
    try {
      const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'addAccount',
          username: newAccount.name,
          password: newAccount.password,
          description: newAccount.description
        }),
      });

      const data = await response.json();
      
      if (data?.status === "1") {
        setNewAccount({ name: '', password: '', description: '' });
        setOpenAddDialog(false);
        alert("Hesap başarıyla eklendi");
        fetchAccounts();
      } else {
        alert('Hesap eklenirken bir hata oluştu: ' + (data?.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Sunucu ile iletişim kurulurken bir hata oluştu');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'deleteAccount',
          username: accountToDelete
        })
      });

      const data = await response.json();
      
      if (data?.status === "1") {
        alert("Hesap başarıyla silindi");
        fetchAccounts();
      } else {
        alert('Hesap silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Sunucu ile iletişim kurulurken bir hata oluştu');
    }

    setAccountToDelete(null);
    setSelected([]);
    setOpenDeleteDialog(false);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: '0 auto' }}>
      {/* Hesap Yönetimi Butonları */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
          Hesap Ekle
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          disabled={selected.length !== 1}
          onClick={() => {
            setAccountToDelete(selected[0]);
            setOpenDeleteDialog(true);
          }}
        >
          Hesap Sil
        </Button>
      </div>

      {/* Hesap Listesi */}
      <TableContainer component={Paper} sx={{ mb: 3, maxHeight: '400px', overflowY: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < accounts.length}
                  checked={accounts.length > 0 && selected.length === accounts.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>Şifre</TableCell>
              <TableCell>Açıklama</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow
                key={account.name}
                selected={selected.includes(account.name)}
                hover
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(account.name)}
                    onChange={() => handleSelect(account.name)}
                  />
                </TableCell>
                <TableCell>{account.name || 'İsimsiz'}</TableCell>
                <TableCell>{account.password || '-'}</TableCell>
                <TableCell>{account.description || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Twitter İşlemleri Formu */}
      <Stack spacing={3}>
        <TextField
          label="Tweet URL"
          fullWidth
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
        />
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <FormControlLabel
            control={<Checkbox checked={like} onChange={() => setLike(!like)} />}
            label="Like"
          />
          <FormControlLabel
            control={<Checkbox checked={retweet} onChange={() => setRetweet(!retweet)} />}
            label="Retweet"
          />
          <FormControlLabel
            control={<Checkbox checked={comment} onChange={() => setComment(!comment)} />}
            label="Yorum"
          />
        </Stack>

        {comment && (
          <TextField
            label="Yorum"
            fullWidth
            multiline
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        )}

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={selected.length === 0}
          sx={{ mt: 2 }}
        >
          Çalıştır ({selected.length})
        </Button>

        {/* Sonuçlar Tablosu */}
        {results && (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hesap Adı</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Mesaj</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.HesapAdi}</TableCell>
                    <TableCell>{result.Durum}</TableCell>
                    <TableCell>{result.Mesaj}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      {/* Hesap Ekleme Dialog'u */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Yeni Hesap Ekle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Kullanıcı Adı"
            fullWidth
            value={newAccount.name}
            onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Şifre"
            fullWidth
            value={newAccount.password}
            onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            value={newAccount.description}
            onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>İptal</Button>
          <Button onClick={handleAddAccount}>Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Hesap Silme Dialog'u */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Hesap Silme Onayı</DialogTitle>
        <DialogContent>
          {accountToDelete && `${accountToDelete} hesabını silmek istediğinizden emin misiniz?`}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">Sil</Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography>
          İşlem devam ediyor, lütfen bekleyiniz...
        </Typography>
      </Backdrop>
    </Box>
  );
};

export default ActionsForm;
