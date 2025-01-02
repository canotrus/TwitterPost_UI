import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

const AccountList = ({onAddAccount, onDeleteAccount }) => {
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

  useEffect(() => {
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
        console.log('Gelen veri:', data);
        const formattedData = Array.isArray(data) ? data : [data];
        setAccounts(formattedData);
      } catch (error) {
        console.error('Hesaplar yüklenirken hata:', error);
        setAccounts([]);
      }
    };

    fetchAccounts();
  }, []);


  // Hesapların var olup olmadığını kontrol et
  if (!accounts || accounts.length === 0) {
    return <div>Henüz hesap bulunmamaktadır.</div>;
  }

  // Tüm hesapları seç/seçimi kaldır
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = accounts.map((account) => account.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Tek bir hesabı seç/seçimi kaldır
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

  const isSelected = (name) => selected.indexOf(name) !== -1;

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
      console.log('Sunucu yanıtı:', data);
      
      if (data?.status === "1") {
        setNewAccount({ name: '', password: '', description: '' });
        setOpenAddDialog(false);
        alert("Hesap başarıyla eklendi");

        // Hesap listesini yeniden yükle
        const listResponse = await fetch('http://localhost:5000', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'listAccount'
          })
        });

        if (listResponse.ok) {
          const listData = await listResponse.json();
          const formattedData = Array.isArray(listData) ? listData : [listData];
          setAccounts(formattedData);
        }
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
        // Silme işlemi başarılı
        alert("Hesap başarıyla silindi");
        
        // Hesap listesini yeniden yükle
        const listResponse = await fetch('http://localhost:5000', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'listAccount'
          })
        });

        if (listResponse.ok) {
          const listData = await listResponse.json();
          const formattedData = Array.isArray(listData) ? listData : [listData];
          setAccounts(formattedData);
        }
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '800px', margin: '0 auto', marginBottom: '1rem' }}>
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

      <TableContainer 
        component={Paper} 
        sx={{
          maxHeight: '400px', // 10 satır için yaklaşık yükseklik
          width: '800px',
          margin: '0 auto', // sayfada ortalamak için
          overflowY: 'auto', // dikey scroll bar için
        }}
      >
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
            {accounts.map((account, index) => {
              const isItemSelected = isSelected(account.name);
              return (
                <TableRow
                  key={account.name || index} // Benzersiz key için fallback ekle
                  selected={isItemSelected}
                  hover
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleSelect(account.name)}
                    />
                  </TableCell>
                  <TableCell>{account.name || 'İsimsiz'}</TableCell>
                  <TableCell>{account.password || '-'}</TableCell>
                  <TableCell>{account.description || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
    </>
  );
};

export default AccountList;
