const supabase = require('../config/supabase');

exports.getTest1Data = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user')
            .select('*');
        
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (!data) {
            return res.status(404).json({ error: 'No data found' });
        }

        res.json(data);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTest2Data = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('organization')
            .select('*');
        
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (!data) {
            return res.status(404).json({ error: 'No data found' });
        }

        res.json(data);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};