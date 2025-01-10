import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { GOOGLE_API_KEY } from '../env.config';

interface PlacePrediction {
  description: string;
  matched_substrings: {
    length: number;
    offset: number;
  }[];
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    main_text_matched_substrings: {
      length: number;
      offset: number;
    }[];
    secondary_text?: string;
  };
  terms: {
    offset: number;
    value: string;
  }[];
  types: string[];
}

interface GoogleAxiosResponse {
  data: { predictions: PlacePrediction[]; status: string };
}

export const getAddressSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;
    const googleRespone = (await axios(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_API_KEY}`
    )) as GoogleAxiosResponse;
    res.json(googleRespone.data);
  } catch (error) {
    next(error);
  }
};
