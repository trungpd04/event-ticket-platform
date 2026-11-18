import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

class BrandMark extends StatelessWidget {
  const BrandMark({super.key});

  @override
  Widget build(BuildContext context) => const Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.all(Radius.circular(12)),
            ),
            child: SizedBox(
              width: 40,
              height: 40,
              child: Icon(Icons.confirmation_num_outlined, color: Colors.white),
            ),
          ),
          SizedBox(width: 10),
          Text('LetTicket', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 22)),
        ],
      );
}
